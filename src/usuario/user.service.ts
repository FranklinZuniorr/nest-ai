import { HttpStatus, Injectable } from '@nestjs/common';
import { UserDto } from './user.entity';
import { BcryptService } from './bcrypt/bcrypt.service';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import * as Dropbox from 'dropbox';
import { AuthService } from './accessTokenAndRefreshToken/AuthService';
import { JwtService } from '@nestjs/jwt';
import { AccessDto, RefreshDto } from './accessTokenAndRefreshToken/refreshAndAccessDto';
import { response, responseBuscaPorEmailDeUsuario, responseBuscaPorNomeDeUsuario } from 'src/core/http/responseDto/response';
import { utils } from 'src/utils/utils';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/mongoDb/user.schema';
import { Model } from 'mongoose';
import { UserEdit } from './user.entity.edit';
import { Email } from './email.entity';
import { RabbitMQService } from 'src/rabbitMq/rabbitMq.service';
import { UserLogin } from './user.entity.login';
import { Access } from 'src/mongoDb/access.schema';
import * as moment from "moment";
import { error } from 'console';
import { UserQueries } from './user.entity.queries';
import { UserTop10 } from './user.entity.top10';
import { ExternalUrl } from './user.entity.externalUrl';
import { Themes } from './user.entity.themes';

const jwtService = new JwtService();
@Injectable()
export class UsuarioService extends AuthService {
    
    constructor(
        @InjectModel(User.name) private userModel: Model<User>, 
        private readonly rabbitMQService: RabbitMQService,
        @InjectModel(Access.name) private accessModel: Model<Access>,
        @InjectModel(Themes.name) private themesModel: Model<Themes>
    ){
        super(jwtService)
    }
    
    public async create(usuario: UserDto): Promise<response> {

        if(!(await this.buscaPorEmailDeUsuario(usuario.email)).exist && !(await this.buscaPorNomeDeUsuario(usuario.username)).exist){

            const { email, password, username } = usuario;

            /* if(password.toString().length < 8){
                return {r: false, data: `A senha precisa ter ao menos 8 caracteres!`, status: HttpStatus.BAD_REQUEST};
            }; */
            
            const userFilter = {
                email: email.toLowerCase(), 
                password: await this.setHash(password), 
                username, 
                coins: 0, 
                validToken: "", 
                img: "",
                externalUrl: ""
            };
            const createdUser = new this.userModel(userFilter);
            createdUser.save();
            console.log(createdUser);
            
            return {r: true, data: {msg: "Registrado com sucesso!"}, status: HttpStatus.CREATED};
        }else{

            console.log(this.buscaPorEmailDeUsuario(usuario.email));

            if((await this.buscaPorEmailDeUsuario(usuario.email)).exist && (await this.buscaPorNomeDeUsuario(usuario.username)).exist){
                return {r: false, data: {msg: `E-mail e nome já existem na base de dados!`}, status: HttpStatus.BAD_REQUEST};
            }else{
                const emailAndNameExist = (await this.buscaPorEmailDeUsuario(usuario.email)).exist? "E-mail":"Nome"; 
    
                return {r: false, data: {msg: `${emailAndNameExist} já existe na base de dados!`}, status: HttpStatus.BAD_REQUEST};
            };

        };

    };

    public async edit(token: string, body: UserEdit): Promise<response> {

        const verifyToken = await this.verifyToken(token, "access");
        let exist = {
            username: undefined,
            email: undefined
        };
        const { username, email, password } = body;

        (await this.buscaPorEmailDeUsuario(email)).exist? exist.email = true:false;
        (await this.buscaPorNomeDeUsuario(username)).exist? exist.username = true:false;

        const userFound = await this.userModel.findOne({ "email": verifyToken.user.email.toLowerCase() })
            .exec()
            .then((doc) => doc?.toObject())
            .catch((err) => err);

        if(utils.verifyCond(password)){
            const verification = await this.compareHashedPasswordAndPassword(password, userFound.password);
    
            if(verification){
                return {r: false, data: {msg: `Coloque uma senha diferente da anterior!`}, status: HttpStatus.BAD_REQUEST};
            };
        };

        if(exist.email && exist.username){
            return {r: false, data: {msg: `E-mail e nome já existem na base de dados!`}, status: HttpStatus.BAD_REQUEST};
        };

        if(exist.email || exist.username){
            return {r: false, data: {msg: `${exist.email? "E-mail":"Nome"} já existe na base de dados!`}, status: HttpStatus.BAD_REQUEST};
        };

        if(!utils.verifyCond(username) && !utils.verifyCond(email) && !utils.verifyCond(password)){
            return {r: false, data: {msg: "Nenhum dado de alteração foi encontrado!"}, status: HttpStatus.BAD_REQUEST};
        };

        const user = await this.userModel.findByIdAndUpdate(
            verifyToken.user.id,
            { $set: { 
            ...(utils.verifyCond(username) && !exist.username && {username}), 
            ...(utils.verifyCond(email) && !exist.email && {email: email.toLowerCase()}), 
            ...(utils.verifyCond(password) && {password: await this.setHash(password)})
            }},
            { new: true }
        ).exec();
    
        if (utils.verifyCond(user)) {
            if(verifyToken.msg == "Alteração de senha."){
                await this.userModel.findByIdAndUpdate(
                    verifyToken.user.id,
                    { $set: { 
                        validToken: ""
                    }
                    },
                    { new: true }
                ).exec();
            };
            return { r: true, data: {msg: `${user.email} editado com sucesso!`}, status: HttpStatus.OK };
        }else{
            return { r: false, data: {msg: "Usuário não foi encontrado!"}, status: HttpStatus.BAD_REQUEST };
        };
    };

    public async delete(token: string): Promise<response>{

        const verifyToken = await this.verifyToken(token, "access");

        const user = await this.userModel.findByIdAndRemove(
            verifyToken.user.id,
            { select: "email" }
        ).exec();
    
        if (user) {
            console.log("---------------------")
            console.log(user);
            return { r: true, data: {msg: `${user.email} deletado com sucesso!`}, status: HttpStatus.OK };
        };
    
        return { r: false, data: {msg: "Usuário não foi encontrado!"}, status: HttpStatus.CREATED };

    };

    public async login(usuario: UserLogin): Promise<response> {

        if((await this.buscaPorEmailDeUsuario(usuario.email)).exist){

            const userFound = await this.userModel.findOne({ "email":usuario.email.toLowerCase() })
            .exec()
            .then((doc) => doc?.toObject())
            .catch((err) => err);

            const { email, password, username, _id, img, coins } = userFound;

            const verification = await this.compareHashedPasswordAndPassword(usuario.password, password);
            const userFilter = {email: email, username: username, id: _id, img: img, coins: coins};

            if(!verification){
                return {r: false, data: {msg: "Senha incorreta!"}, status: HttpStatus.BAD_REQUEST}
            };

            /* await this.rabbitMQService.sendMessage("oioioi") */
            /* await this.rabbitMQService.sendToExchange("testeex", 'teste', "dasdasd") */

            const newToken = await this.generateAccessToken({user: userFilter, type: "access"});

            const userEdit = await this.userModel.findByIdAndUpdate(
                userFilter.id,
                { $set: { 
                    validToken: newToken
                }
                },
                { new: true }
            ).exec()

            if(utils.verifyCond(userEdit)){   

                const actualDateMonth = moment().format("MM/YYYY");
                const actualDateDay = moment().format("DD/MM/YYYY");

                const options = {
                    upsert: true,
                    new: true,
                };

                const findMounth = await this.accessModel.findOne({date: actualDateMonth}).exec()
                .then((doc) => doc?.toObject().access)
                .catch((err) => err);

                console.log(findMounth)

                if(findMounth != undefined){
                    const arr = [...(JSON.parse(JSON.stringify(findMounth)))];

                    if(arr[0][actualDateDay]){
                        const day = [...arr[0][actualDateDay]];
                        const findId = day.find(day => day._id == _id);

                        if(!findId){
                            console.log("Não achou!");
                            await this.accessModel.findOneAndUpdate(
                                { date: actualDateMonth },
                                { $addToSet: { [`access.${actualDateDay}`]: {
                                    _id,
                                    username,
                                    email,
                                    img
                                } } },
                                options
                            ).exec().then(res => res).catch(err => err);
                            console.log("Criou!")
                        }else{
                            console.log("Achou!");
                            console.log(findId)
                        };
                    }else{
                        await this.accessModel.findOneAndUpdate(
                            { date: actualDateMonth },
                            { $addToSet: { [`access.${actualDateDay}`]: {
                                _id,
                                username,
                                email,
                                img
                            } } },
                            options
                        ).exec().then(res => res).catch(err => err);
                    };
                }else{
                    await this.accessModel.findOneAndUpdate(
                        { date: actualDateMonth },
                        { $addToSet: { [`access.${actualDateDay}`]: {
                            _id,
                            username,
                            email,
                            img
                        } } },
                        options
                    ).exec().then(res => res).catch(err => err);
                };

                /* const dailyAccess = await this.accessModel.findOneAndUpdate(
                    { date: actualDateMonth },
                    { $addToSet: { [`access.${actualDateDay}`]: {
                        _id,
                        username,
                        email,
                        img,
                        coins
                    } } },
                    options
                ).exec().then(res => res).catch(err => err); */

                /* const countTotalElements = await this.accessModel.aggregate([
                    { $match: { date: actualDateMonth } },
                    {
                        $project: {
                        totalElements: {
                            $reduce: {
                            input: { $objectToArray: "$access" },
                            initialValue: 0,
                            in: { $add: ["$$value", { $size: "$$this.v" }] }
                            }
                        }
                        }
                    }
                ]).exec().then(res => res).catch(err => err); */

                return {
                    r: true, 
                    data: { 
                        token: newToken, 
                        refreshToken: await this.generateRefreshToken({user: userFilter, type: "refresh"}),
                    }, 
                    status: HttpStatus.ACCEPTED
                };
            };

        }else{
            return {r: false, data: {msg: "Usuário não foi encontrado!"}, status: HttpStatus.BAD_REQUEST};
        };
    };

    public async logout(accessToken: string){

        const verifyToken = await this.verifyToken(accessToken, 'access');

        const userEdit = await this.userModel.findByIdAndUpdate(
            verifyToken.user.id,
            { $set: { 
                validToken: ""
            }
            },
            { new: true }
        ).exec();

        if(utils.verifyCond(userEdit)){
            return {r: true, data: {msg: "Deslogado com sucesso!"}, status: HttpStatus.OK};
        };

    };

    public async uploadImage(file, code: string, token: string): Promise<response>{
        console.log(file)
        console.log(code)

        if(code != undefined && code.length > 0){
            if(file != null && !file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) return {r: false, data: {msg: "Só imagens são permitadas!"}, status: HttpStatus.BAD_REQUEST};
            if(file == null) return {r: false, data: {msg: "Insira ao menos um arquivo!"}, status: HttpStatus.BAD_REQUEST};

            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');

            const url = 'https://api.dropboxapi.com/oauth2/token';
            const data = new URLSearchParams();
            data.append('code', code);
            data.append('grant_type', 'authorization_code');
            data.append('client_id', process.env.DROPBOX_CLIENT_ID);
            data.append('client_secret', process.env.DROPBOX_CLIENT_SECRET);
            data.append('redirect_uri', process.env.DROPBOX_REDIRECT_URI);

            try {
                const response = await axios.post(url, data.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
                });

                if(response.statusText === "OK"){
                    const dropbox = new Dropbox.Dropbox({
                        accessToken: response.data.access_token,
                        clientId: process.env.DROPBOX_CLIENT_ID,
                        clientSecret: process.env.DROPBOX_CLIENT_SECRET
                    });
    
                    const verifyToken = await this.verifyToken(token, "access");
            
                    const result = await dropbox.filesUpload({
                    path: `/${randomName}${extname(file.originalname)}`,
                    contents: file.buffer,
                    }).then(res => res).catch(err => err);
                    
                    if(result instanceof Error){
                        return {r: false, data: {info: utils.errorExternalServicesTreatment(result), msg: "Erro ao enviar imagem!"}, status: HttpStatus.INTERNAL_SERVER_ERROR};
                    };
                    
                    if(result.status == 200){
                        const userFilter = await this.userModel.findById(verifyToken.user.id).exec().then((doc) => doc?.toObject()).catch((err) => err);
                        
                        try {

                            const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({
                                path: result.result.path_display
                            }).catch(() => {throw {msg: "GENERATE"}})
                                                    
                            const user = await this.userModel.findByIdAndUpdate(verifyToken.user.id, 
                                { $set: { img: sharedLink.result.url.replace("?dl=0", "?raw=1") } }, 
                                { new: true }).exec();

                            if(utils.verifyCond(user)){
                                if("img" in userFilter && userFilter.img != ""){
                                    try {
                                        const metadata = await dropbox.sharingGetSharedLinkMetadata({ url: userFilter.img })
                                        .then(res => res).catch(err => err);
                                        const filePath = metadata.result.path_lower;
                                        const response = await dropbox.filesGetMetadata({ path: filePath }).then(async () => {
                                            await dropbox.filesDeleteV2({ path: filePath });
                                        })
                                    } catch (error) {
                                        throw {msg: "DELETE"}
                                    }
                                };
                            };
                            return {r: true, data: {url: sharedLink.result.url.replace("?dl=0", "?raw=1"), msg: "Imagem enviada com sucesso!"}, status: HttpStatus.CREATED};
                        } catch (error) {
                            console.log(error)
                            await this.rabbitMQService.sendToExchange("AICORRIGEAPI", 'KEYAICORRIGEAPI', 
                            {
                                dropbox: {
                                accessToken: response.data.access_token,
                                clientId: process.env.DROPBOX_CLIENT_ID,
                                clientSecret: process.env.DROPBOX_CLIENT_SECRET
                                },
                                path: result.result.path_display,
                                userId: verifyToken.user.id,
                                msg: error.msg,
                                oldLinkImg: userFilter.img
                            });
                            return {r: true, data: {url: "", msg: "Imagem armazenada, url em tratativa de erro!"}, status: HttpStatus.INTERNAL_SERVER_ERROR};
                        };
                    };
                };
            } catch (error) {
                console.log(error)
                return {r: false, data: {info: utils.errorExternalServicesTreatment(error), dropBox: error.response.data, msg: "DropBox error."}, status: HttpStatus.BAD_REQUEST};
            };
        };
        return {r: true, data: {msg: "O login no dropBox é necessário!", url: `https://www.dropbox.com/oauth2/authorize?client_id=${process.env.DROPBOX_CLIENT_ID}&response_type=code&redirect_uri=${process.env.DROPBOX_REDIRECT_URI}`}, status: HttpStatus.ACCEPTED};

    };

    public async editPassword(emailInfo: Email): Promise<response>{

        if(utils.verifyCond(emailInfo)){

            const userFound = await this.userModel.findOne({ "email":emailInfo.email.toLowerCase() })
            .exec();

            if(!userFound) return {r: false, data: {msg: "E-mail não foi encontrado!"}, status: HttpStatus.BAD_REQUEST};

            const date = moment().format("DD/MM/YYYY");

            const {lastRequestForgotPassword, _id, email} = userFound;

            if(lastRequestForgotPassword != date){

                const newToken = await this.generateAccessToken({msg: "Alteração de senha.", type: "access", user: {id: _id, email}});

                await this.userModel.findByIdAndUpdate(
                    _id,
                    { $set: { 
                        validToken: newToken,
                        lastRequestForgotPassword: date
                    }
                    },
                    { new: true }
                ).exec();
                
                return await utils.sendEmail(`${process.env.URL_REDIRECT_EDIT_PASSWORD}?accessToken=${newToken}`, "Alteração de senha.", emailInfo.email);

            }else{
                return {r: false, data: {msg: "Limite de solicitações atingido, tente novamente amanhã!"}, status: HttpStatus.BAD_REQUEST};
            };

        }else{
            return {r: false, data: {msg: "E-mail não foi enviado!"}, status: HttpStatus.BAD_REQUEST};
        };

    };

    public async refreshToken(refreshToken: RefreshDto): Promise<response>{

        const data = await this.verifyRefreshTokenAndGenerateTokens(refreshToken);

        if(data.r){
            const verifyToken = await this.verifyToken(refreshToken.refreshToken, "refresh");

            const userEdit = await this.userModel.findByIdAndUpdate(
                verifyToken.user.id,
                { $set: { 
                    validToken: data.data.token
                }
                },
                { new: true }
            ).exec();

            if(utils.verifyCond(userEdit)){
                return data;
            };
        }

        return data;
    };

    public async accessToken(accessToken: string): Promise<response>{

        const verifyToken = await this.verifyToken(accessToken, "access");
        
        if(verifyToken instanceof Error){
            return await this.verifyAccessTokenPass(accessToken);
        };

        const user = await this.userModel.findById(verifyToken.user.id).exec().then((doc) => doc?.toObject()).catch((err) => err);

        if(!user){
            return {r: false, data: {msg: "Usuário do accessToken não existe!"}, status: HttpStatus.BAD_REQUEST};
        };

        const { username, email, img, coins, validToken, _id, queries, questions, shopping, externalUrl } = user;

        if(questions != undefined){
            let questionsFilter = questions;
            
            questions.forEach((question, index)=> {
                questionsFilter[index].data.data.answer =
                {
                    questao1: {
                        A: question.data.data.answer.questao1.A,
                        B: question.data.data.answer.questao1.B,
                        C: question.data.data.answer.questao1.C,
                        D: question.data.data.answer.questao1.D,
                        pergunta: question.data.data.answer.questao1.pergunta
                    },
                    questao2: {
                        A: question.data.data.answer.questao2.A,
                        B: question.data.data.answer.questao2.B,
                        C: question.data.data.answer.questao2.C,
                        D: question.data.data.answer.questao2.D,
                        pergunta: question.data.data.answer.questao2.pergunta
                    },
                    questao3: {
                        A: question.data.data.answer.questao3.A,
                        B: question.data.data.answer.questao3.B,
                        C: question.data.data.answer.questao3.C,
                        D: question.data.data.answer.questao3.D,
                        pergunta: question.data.data.answer.questao3.pergunta
                    },
                    questao4: {
                        A: question.data.data.answer.questao4.A,
                        B: question.data.data.answer.questao4.B,
                        C: question.data.data.answer.questao4.C,
                        D: question.data.data.answer.questao4.D,
                        pergunta: question.data.data.answer.questao4.pergunta
                    },
                    questao5: {
                        A: question.data.data.answer.questao5.A,
                        B: question.data.data.answer.questao5.B,
                        C: question.data.data.answer.questao5.C,
                        D: question.data.data.answer.questao5.D,
                        pergunta: question.data.data.answer.questao5.pergunta
                    },
                    resumo: question.data.data.answer.resumo
                };
            });
        };

        if(user && user.validToken == accessToken){
            return {r: true, data: {msg: "AccessTokenOk!", user: {username, email, img, coins, validToken, queries, questions, shopping, _id: _id.toString(), externalUrl }}, status: HttpStatus.OK};
        };

        return {r: false, data: {msg: "Token inválido!"}, status: HttpStatus.BAD_REQUEST};
    };

    public async uploadQueries(accessToken: string, body: UserQueries): Promise<response>{

        const verifyToken = await this.verifyToken(accessToken, "access");
        const bodyCustom:any = {...body, createdAt: moment().subtract(3, 'hours').toISOString()};
        let totalNote = 0;

        const userDefault = await this.userModel.findById(
            verifyToken.user.id,
            {
                questions: 1
            }
        );

        const questions:any = userDefault.questions;

        const questionFind = questions.find(question => question.createdAt == bodyCustom.query.createdAt);

        if(questionFind){
            const qFindFilter = questionFind.data.data.answer;
            const newQuery = {...questionFind.data.data.answer};
    
            Object.keys(qFindFilter).forEach(item => {
                if(item.includes("questao")){
                    newQuery[item] = {
                        A: newQuery[item]["A"],
                        B: newQuery[item]["B"],
                        C: newQuery[item]["C"],
                        D: newQuery[item]["D"],
                        pergunta: newQuery[item]["pergunta"],
                        alternativa_correta: newQuery[item]["alternativa_correta"],
                        alternativa_marcada: bodyCustom.query.data[item],
                        motivo_alternativa: newQuery[item]["motivo_alternativa"],
                        r: qFindFilter[item]["alternativa_correta"] == bodyCustom.query.data[item]? true:false
                    };
    
                    if(qFindFilter[item]["alternativa_correta"] == bodyCustom.query.data[item]){
                        totalNote+=parseInt(bodyCustom.note);
                    };
                };
            });

            console.log(newQuery)
    
            bodyCustom.query = newQuery;
            bodyCustom.totalNote = totalNote;
    
            const user = await this.userModel.findByIdAndUpdate(
                verifyToken.user.id,
                { $addToSet: {
                    [`queries.${body.theme}.arr`]: {...bodyCustom},
                  },
                  $inc: {
                    [`queries.${body.theme}.totalNote`]: totalNote,
                    queriesTotal: totalNote
                  },
                },
                { new: true }
            ).exec();
    
            const userRemove = await this.userModel.findByIdAndUpdate(
                verifyToken.user.id,
                { 
                  $pull: {
                    questions: {createdAt: body.query["createdAt"]}
                  }
                },
                { new: true }
            ).exec();
    
            if(!utils.verifyCond(user)){
                return {r: false, data: {msg: "Erro ao salvar atividade no histórico!"}, status: HttpStatus.INTERNAL_SERVER_ERROR};
            };
    
            return {r: true, data: {msg: "Atividade respondida com sucesso!", query: bodyCustom }, status: HttpStatus.ACCEPTED};
        };

        return {r: false, data: {msg: "Atividade não existe!"}, status: HttpStatus.BAD_REQUEST};
    };

    public async getTop10(): Promise<response>{

        const data = await this.userModel.aggregate([
            { $match: { queriesTotal: { $exists: true } } },
            { $sort: { queriesTotal: -1 } },
            { $limit: 10 },
            { $project: { username: 1, email: 1, img: 1, queriesTotal: 1, externalUrl: 1} },
        ]);

        return {r: true, data: {msg: "Ranking obtido!", list: data}, status: HttpStatus.ACCEPTED};

    };

    public async setExternalUrl(accessToken: string, body: ExternalUrl): Promise<response>{
        console.log(utils.isLinkValid(body.externalUrl))

        if(utils.isLinkValid(body.externalUrl)){
            const verifyToken = await this.verifyToken(accessToken, "access");
    
            const user = await this.userModel.findByIdAndUpdate(
                verifyToken.user.id,
                {
                    $set: {
                        externalUrl: body.externalUrl
                    }
                }
            );
    
            if(utils.verifyCond(user)){
                return {r: true, data: {msg: "Url adicionada com sucesso!"}, status: HttpStatus.ACCEPTED}
            };
        };

        return {r: false, data: {msg: "Precisa ser um link!"}, status: HttpStatus.BAD_REQUEST}
    };

    public async getThemes(body: Themes): Promise<response>{
        const pageNumber = body.page; 
        const pageSize = 10;

        const skip = (pageNumber - 1) * pageSize;

        const themes = await this.themesModel.aggregate([
        { $skip: skip },
        { $limit: pageSize},
        { $sort: { createdAt: 1 }}
        ]);

        const totalDocuments = await this.themesModel.countDocuments().exec();
        const pages = (totalDocuments/pageSize).toFixed();

        return {r: true, data: {msg: "Temas obtidos!", data: themes, totalDocuments, pages}, status: HttpStatus.ACCEPTED}
    };

    //-------------------------------------------------------

    private async setHash(password){
        const data = await BcryptService.hashPassword(password);
        return data
    };

    private async compareHashedPasswordAndPassword(password, passwordHashed){
        const data = await BcryptService.comparePassword(password, passwordHashed);
        return data
    };

    public async buscaPorEmailDeUsuario(email: string): Promise<responseBuscaPorEmailDeUsuario> {
        if(email != undefined){
            const filterEmail = email.toLowerCase();
            const usuarioEncontrado = await this.userModel.findOne({ email: filterEmail }).exec();
    
            if(usuarioEncontrado){
                return {exist: true}
            };
    
            return {exist: false};
        };

        return {exist: undefined}
    };

    public async buscaPorNomeDeUsuario(username: string): Promise<responseBuscaPorNomeDeUsuario> {
        if(username != undefined){
            const usuarioEncontrado = await this.userModel.findOne({ username }).exec();
    
            if(usuarioEncontrado){
                return {exist: true}
            };
    
            return {exist: false};
        };

        return {exist: undefined}
    };
};