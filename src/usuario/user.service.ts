import { HttpStatus, Injectable } from '@nestjs/common';
import { Usuario } from './user.entity';
import { BcryptService } from './bcrypt/bcrypt.service';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import * as Dropbox from 'dropbox';
import { AuthService } from './accessTokenAndRefreshToken/AuthService';
import { JwtService } from '@nestjs/jwt';
import { accessDto, refreshDto } from './accessTokenAndRefreshToken/refreshAndAccessDto';
import { response, responseBuscaPorEmailDeUsuario, responseBuscaPorNomeDeUsuario } from 'src/core/http/responseDto/response';
import { utils } from 'src/utils/utils';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/mongoDb/user.schema';
import { Model } from 'mongoose';
import { UsuarioEdit } from './user.entity.edit';
import { email } from './email.entity';
import { RabbitMQService } from 'src/rabbitMq/rabbitMq.service';

const jwtService = new JwtService();
@Injectable()
export class UsuarioService extends AuthService {
    
    constructor(@InjectModel(User.name) private userModel: Model<User>, private readonly rabbitMQService: RabbitMQService){
        super(jwtService)
    }
    
    public async create(usuario: Usuario): Promise<response> {

        if(!(await this.buscaPorEmailDeUsuario(usuario.email)).exist && !(await this.buscaPorNomeDeUsuario(usuario.username)).exist){

            const { email, password, username } = usuario;

            /* if(password.toString().length < 8){
                return {r: false, data: `A senha precisa ter ao menos 8 caracteres!`, status: HttpStatus.BAD_REQUEST};
            }; */
            
            const userFilter = {email: email.toLowerCase(), password: await this.setHash(password), username, coins: 0, validToken: ""};
            const createdUser = new this.userModel(userFilter);
            createdUser.save();
            console.log(userFilter);
            
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

    public async edit(token: string, body: UsuarioEdit): Promise<response> {

        const verifyToken = await this.verifyToken(token, "access");
        let exist = {
            username: undefined,
            email: undefined
        };
        const { username, email, password, coins } = body;

        (await this.buscaPorEmailDeUsuario(email)).exist? exist.email = true:false;
        (await this.buscaPorNomeDeUsuario(username)).exist? exist.username = true:false;


        if(exist.email && exist.username){
            return {r: false, data: {msg: `E-mail e nome já existem na base de dados!`}, status: HttpStatus.BAD_REQUEST};
        };

        if(exist.email || exist.username){
            return {r: false, data: {msg: `${exist.email? "E-mail":"Nome"} já existe na base de dados!`}, status: HttpStatus.BAD_REQUEST};
        };

        if(!utils.verifyCond(username) && !utils.verifyCond(email) && !utils.verifyCond(password) && !utils.verifyCond(coins)){
            return {r: false, data: {msg: "Nenhum dado de alteração foi encontrado!"}, status: HttpStatus.BAD_REQUEST};
        };

        const user = await this.userModel.findByIdAndUpdate(
            verifyToken.user.id,
            { $set: { 
            ...(utils.verifyCond(username) && !exist.username && {username}), 
            ...(utils.verifyCond(email) && !exist.email && {email: email.toLowerCase()}), 
            ...(utils.verifyCond(password) && {password: await this.setHash(password)})
            },
              $inc: {
                ...(utils.verifyCond(coins) && {coins})
              }
            },
            { new: true }
        ).exec();
    
        if (user) {
            console.log(user);
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
            console.log(user);
            return { r: true, data: {msg: `${user.email} deletado com sucesso!`}, status: HttpStatus.OK };
        };
    
        return { r: false, data: {msg: "Usuário não foi encontrado!"}, status: HttpStatus.CREATED };

    };

    public async login(usuario: Usuario): Promise<response> {

        if((await this.buscaPorEmailDeUsuario(usuario.email)).exist){

            const userFound = await this.userModel.findOne({ "email":usuario.email.toLowerCase() })
            .exec()
            .then((doc) => doc?.toObject())
            .catch((err) => err);

            console.log(userFound)

            const { email, password, username, _id } = userFound;

            const verification = await this.compareHashedPasswordAndPassword(usuario.password, password);
            const userFilter = {email: email, username: username, id: _id};

            if(!verification){
                return {r: false, data: {msg: "Senha incorreta!"}, status: HttpStatus.BAD_REQUEST}
            };

            /* await this.rabbitMQService.sendMessage("oioioi") */
            /* await this.rabbitMQService.sendToExchange("testeex", 'teste', "dasdasd") */

            await this.userModel.findByIdAndUpdate(
                userFilter.id,
                { $set: { 
                    validToken: await this.generateAccessToken({user: userFilter, type: "access"})
                }
                },
                { new: true }
            ).exec();
            
            return {
                r: true, 
                data: {
                    userFilter, 
                    token: await this.generateAccessToken({user: userFilter, type: "access"}), 
                    refreshToken: await this.generateRefreshToken({user: userFilter, type: "refresh"})
                }, 
                status: HttpStatus.ACCEPTED
            };

        }else{
            return {r: false, data: {msg: "Usuário não foi encontrado!"}, status: HttpStatus.BAD_REQUEST};
        };
    };

    public async uploadImage(file, code: string, token: string): Promise<response>{
        console.log(file)
        console.log(code)

        if(code != undefined && code.length > 0){
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')

            const url = 'https://api.dropboxapi.com/oauth2/token';
            const data = new URLSearchParams();
            data.append('code', code);
            data.append('grant_type', 'authorization_code');
            data.append('client_id', 'i8p06kgx6l9hvyk');
            data.append('client_secret', '9rfn9d72o3ozhua');
            data.append('redirect_uri', 'https://www.google.com.br/');

            const response = await axios.post(url, data.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            }).then(res => res).catch(err => err);

            console.log(response)

            if(response.statusText === "OK"){
                const dropbox = new Dropbox.Dropbox({
                    accessToken: response.data.access_token,
                    clientId: process.env.DROPBOX_CLIENT_ID,
                    clientSecret: process.env.DROPBOX_CLIENT_SECRET
                });

                const verifyToken = await this.verifyToken(token, "access");

                const userFilter = await this.userModel.findById(verifyToken.user.id).exec().then((doc) => doc?.toObject()).catch((err) => err);

                if(userFilter && "img" in userFilter){
                    const metadata = await dropbox.sharingGetSharedLinkMetadata({ url: userFilter.img });
                    const filePath = metadata.result.path_lower;
                    await dropbox.filesDeleteV2({ path: filePath });
                }else if(!userFilter){
                    return {r: false, data: {msg: "Usuário não foi encontrado!"}, status: HttpStatus.BAD_REQUEST};
                };
        
                const result = await dropbox.filesUpload({
                path: `/${randomName}${extname(file.originalname)}`,
                contents: file.buffer,
                }).then(res => res).catch(err => err);
                
                if(result instanceof Error){
                    return {r: false, data: {info: utils.errorExternalServicesTreatment(result), msg: "Erro ao enviar imagem!"}, status: HttpStatus.INTERNAL_SERVER_ERROR};
                };
                
                if(result.status == 200){
                    try {
                        const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({
                            path: result.result.path_display,
                        });
                    
                        console.log(verifyToken)
                        console.log("------------")
                        const user = await this.userModel.findByIdAndUpdate(verifyToken.user.id, 
                            { $set: { img: sharedLink.result.url.replace("?dl=0", "?raw=1") } }, 
                            { new: true }).exec();
                        console.log("------------")
                        console.log(user)
                        console.log("------------")
                        return {r: true, data: {url: sharedLink.result.url.replace("?dl=0", "?raw=1"), msg: "Imagem enviada com sucesso!"}, status: HttpStatus.CREATED};
                    } catch (error) {
                        await this.rabbitMQService.sendToExchange("testeex", 'teste', 
                        {
                            dropbox: {
                            accessToken: response.data.access_token,
                            clientId: process.env.DROPBOX_CLIENT_ID,
                            clientSecret: process.env.DROPBOX_CLIENT_SECRET
                            },
                            path: result.result.path_display,
                            userId: verifyToken.user.id
                        });
                        return {r: false, data: {url: "", msg: "Imagem armazenada, url em tratativa de erro!"}, status: HttpStatus.INTERNAL_SERVER_ERROR};
                    };
                };
            };
    
            /* axios.get("https://www.dropbox.com/oauth2/authorize?client_id=i8p06kgx6l9hvyk&response_type=code&redirect_uri=https://www.google.com.br/")
            .then(res => console.log(res)).catch(err => console.) */
    
            return {r: false, data: {info: utils.errorExternalServicesTreatment(response), dropBox: response.response.data, msg: "DropBox error."}, status: HttpStatus.BAD_REQUEST};
        }

        return {r: true, data: {info: "O login no dropBox é necessário!", url: "https://www.dropbox.com/oauth2/authorize?client_id=i8p06kgx6l9hvyk&response_type=code&redirect_uri=https://www.google.com.br/"}, status: HttpStatus.ACCEPTED};

    };

    public async editPassword(emailInfo: email): Promise<response>{

        if(utils.verifyCond(emailInfo)){

            const userFound = await this.userModel.findOne({ "email":emailInfo.email.toLowerCase() })
            .exec();

            console.log(userFound)

            if(userFound){
                return await utils.sendEmail(`https://www.google.com.br/?accessToken=${await this.generateAccessToken({msg: "Alteração de senha.", type: "access"})}`, "Alteração de senha.", emailInfo.email);
            }else{
                return {r: false, data: {msg: "E-mail não foi encontrado!"}, status: HttpStatus.BAD_REQUEST}
            };


        }else{
            return {r: false, data: {msg: "E-mail não foi enviado!"}, status: HttpStatus.BAD_REQUEST}
        };

    };

    public async refreshToken(refreshToken: refreshDto): Promise<response>{

        const data = await this.verifyRefreshTokenAndGenerateTokens(refreshToken);

        if(data.r){
            const verifyToken = await this.verifyToken(refreshToken.refreshToken, "refresh");

            await this.userModel.findByIdAndUpdate(
                verifyToken.user.id,
                { $set: { 
                    validToken: data.data.token
                }
                },
                { new: true }
            ).exec();
        };

        return data;

    };

    public async accessToken(accessToken: string): Promise<response>{

        const verifyToken = await this.verifyToken(accessToken, "access");
        
        if(verifyToken instanceof Error){
            return await this.verifyAccessTokenPass(accessToken);
        };

        const user = (await this.userModel.findById(verifyToken.user.id).exec()).toObject();

        if(user.validToken === accessToken){
            return await this.verifyAccessTokenPass(accessToken);
        };

        return {r: false, data: {msg: "Token inválido!"}, status: HttpStatus.BAD_REQUEST};

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