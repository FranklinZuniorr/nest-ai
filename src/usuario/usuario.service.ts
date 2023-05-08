import { HttpStatus, Injectable } from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { BcryptService } from './bcrypt/bcrypt.service';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import * as Dropbox from 'dropbox';
import { AuthService } from './accessTokenAndRefreshToken/AuthService';
import { JwtService } from '@nestjs/jwt';
import { accessDto, refreshDto } from './accessTokenAndRefreshToken/refreshAndAccessDto';
import { response, responseBuscaPorEmailDeUsuario, responseBuscaPorNomeDeUsuario } from 'src/responseDto/response';
import { utils } from 'src/utils/utils';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/mongoDb/user.schema';
import { Model } from 'mongoose';
import { UsuarioEdit } from './usuario.entity.edit';

const jwtService = new JwtService();
@Injectable()
export class UsuarioService extends AuthService {
    
    constructor(@InjectModel(User.name) private userModel: Model<User>){
        super(jwtService)
    }
    
    public async create(usuario: Usuario): Promise<response> {

        if(!(await this.buscaPorEmailDeUsuario(usuario.email)).exist && !(await this.buscaPorNomeDeUsuario(usuario.username)).exist){

            const { email, password, username } = usuario;

            /* if(password.toString().length < 8){
                return {r: false, data: `A senha precisa ter ao menos 8 caracteres!`, status: HttpStatus.BAD_REQUEST};
            }; */
            
            const userFilter = {email: email.toLowerCase(), password: await this.setHash(password), username};
            const createdUser = new this.userModel(userFilter);
            createdUser.save();
            console.log(userFilter);
            
            return {r: true, data: "Registrado com sucesso!", status: HttpStatus.CREATED};
        }else{

            console.log(this.buscaPorEmailDeUsuario(usuario.email));

            if((await this.buscaPorEmailDeUsuario(usuario.email)).exist && (await this.buscaPorNomeDeUsuario(usuario.username)).exist){
                return {r: false, data: `E-mail e nome já existem na base de dados!`, status: HttpStatus.BAD_REQUEST};
            }else{
                const emailAndNameExist = (await this.buscaPorEmailDeUsuario(usuario.email)).exist? "E-mail":"Nome"; 
    
                return {r: false, data: `${emailAndNameExist} já existe na base de dados!`, status: HttpStatus.BAD_REQUEST};
            };

        };

    };

    public async edit(token: string, body: UsuarioEdit): Promise<response> {

        const verifyToken = await this.verifyToken(token, "access");
        let exist = undefined;
        const { username, email, password } = body;

        const verifyCond = (data) => {
            if(data != undefined && data != "" && data != null){
                return true
            };

            return false
        };

        if(!(await this.buscaPorEmailDeUsuario(email)).exist && 
        (await this.buscaPorEmailDeUsuario(email)).exist != undefined && 
        !(await this.buscaPorNomeDeUsuario(username)).exist &&
        (await this.buscaPorNomeDeUsuario(username)).exist != undefined){

            exist = false;

        }else{

            if((await this.buscaPorEmailDeUsuario(email)).exist && 
            (await this.buscaPorEmailDeUsuario(email)).exist != undefined && 
            (await this.buscaPorNomeDeUsuario(username)).exist && 
            (await this.buscaPorNomeDeUsuario(username)).exist != undefined){
                return {r: false, data: `E-mail e nome já existem na base de dados!`, status: HttpStatus.BAD_REQUEST};
            }else{
                const emailAndNameExist = (await this.buscaPorEmailDeUsuario(email)).exist? "E-mail":"Nome"; 
    
                return {r: false, data: `${emailAndNameExist} já existe na base de dados!`, status: HttpStatus.BAD_REQUEST};
            };

        };


        const user = await this.userModel.findByIdAndUpdate(
            verifyToken.user.id,
            { $set: { ...(verifyCond(username) && !exist && {username}), ...(verifyCond(email) && !exist && {email: email.toLowerCase()}), ...(verifyCond(password) && !exist && {password: await this.setHash(password)}) } },
            { new: true }
        ).exec();
    
        if (user) {
            console.log(user);
            return { r: true, data: "Editado com sucesso!", status: HttpStatus.OK };
        }
    
        return { r: false, data: "Usuário não foi encontrado!", status: HttpStatus.CREATED };

    };

    public async login(usuario: Usuario): Promise<response> {

        if((await this.buscaPorEmailDeUsuario(usuario.email)).exist){

            const userFound = await this.userModel.findOne({ "email":usuario.email.toLowerCase() })
            .exec()
            .then((doc) => doc?.toObject())
            .catch((err) => err);

            console.log(userFound)

            const { email, password, username, _id } = userFound;

            const verification = await this.compareHashedPasswordAndPassword(usuario.password, userFound.password);
            const userFilter = {email: email, username: username, id: _id};

            if(!verification){
                return {r: false, data: "Senha incorreta!", status: HttpStatus.BAD_REQUEST}
            };
            
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
            return {r: false, data: "Usuário não foi encontrado!", status: HttpStatus.BAD_REQUEST};
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
            }).then(res => res).catch(err => err)

            console.log(response)

            if(response.statusText === "OK"){
                const dropbox = new Dropbox.Dropbox({
                    accessToken: response.data.access_token,
                    clientId: "i8p06kgx6l9hvyk",
                    clientSecret: "9rfn9d72o3ozhua"
                });
        
                const result = await dropbox.filesUpload({
                path: `/${randomName}${extname(file.originalname)}`,
                contents: file.buffer,
                }).then(res => res).catch(err => err);
                
                if(result.status == 200){
                    const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({
                        path: result.result.path_display,
                    });

                    const verifyToken = await this.verifyToken(token, "access");
                    console.log(verifyToken.user.id)
                    const user = await this.userModel.findByIdAndUpdate(verifyToken.user.id, 
                        { $set: { img: sharedLink.result.url.replace("?dl=0", "?raw=1") } }, 
                        { new: true }).exec();
                    console.log("------------")
                    console.log(user)
                    console.log("------------")
                    return {r: true, data: {url: sharedLink.result.url.replace("?dl=0", "?raw=1"), result}, status: HttpStatus.CREATED};
                }

                return {r: false, data: "Erro ao fazer upload da imagem, tente novamente.", status: HttpStatus.INTERNAL_SERVER_ERROR};
            }


    
            /* axios.get("https://www.dropbox.com/oauth2/authorize?client_id=i8p06kgx6l9hvyk&response_type=code&redirect_uri=https://www.google.com.br/")
            .then(res => console.log(res)).catch(err => console.) */
    
            return {r: false, data: {info: utils.errorExternalServicesTreatment(response), dropBox: response.response.data}, status: HttpStatus.BAD_REQUEST}
        }

        return {r: true, data: {info: "O login no dropBox é necessário!", url: "https://www.dropbox.com/oauth2/authorize?client_id=i8p06kgx6l9hvyk&response_type=code&redirect_uri=https://www.google.com.br/"}, status: HttpStatus.ACCEPTED}


    }

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