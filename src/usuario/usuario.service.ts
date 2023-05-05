import { HttpStatus, Injectable } from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { BcryptService } from './bcrypt/bcrypt.service';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import * as Dropbox from 'dropbox';
import { AuthService } from './accessTokenAndRefreshToken/AuthService';
import { JwtService } from '@nestjs/jwt';
import { accessDto, refreshDto } from './accessTokenAndRefreshToken/refreshAndAccessDto';
import { response } from 'src/responseDto/response';
import { utils } from 'src/utils/utils';
import axios from 'axios';

const jwtService = new JwtService();
@Injectable()
export class UsuarioService extends AuthService {
    
    constructor(){
        super(jwtService)
    }

    private usuarios: Array<Usuario> = [{ 
        id: 1,
        email: 'gabriel.leite@alura.com.br',
        senha: '123456',
        username: "gabrico"
    }];
    
    public async create(usuario: Usuario): Promise<response> {

        if(!this.buscaPorEmailDeUsuario(usuario.email).exist && !this.buscaPorNomeDeUsuario(usuario.username).exist){

            const { email, senha, username } = usuario;
            
            const userFilter = {email: email, senha: await this.setHash(senha), username, id: this.usuarios.length};
            this.usuarios.push(userFilter);
            console.log(userFilter);
            
            return {r: true, data: "Registrado com sucesso!", status: HttpStatus.CREATED};
        }else{

            console.log(this.buscaPorEmailDeUsuario(usuario.email));

            if(this.buscaPorEmailDeUsuario(usuario.email).exist && this.buscaPorNomeDeUsuario(usuario.username).exist){
                return {r: false, data: `E-mail e nome já existem na base de dados!`, status: HttpStatus.BAD_REQUEST};
            }else{
                const emailAndNameExist = this.buscaPorEmailDeUsuario(usuario.email).exist? "E-mail":"Nome"; 
    
                return {r: false, data: `${emailAndNameExist} já existe na base de dados!`, status: HttpStatus.BAD_REQUEST};
            };

        };

    };

    public async login(usuario: Usuario): Promise<response> {

        if(this.buscaPorEmailDeUsuario(usuario.email).exist){

            const userFound = this.buscaPorEmailDeUsuario(usuario.email);

            const { email, senha } = usuario;

            const verification = await this.compareHashedPasswordAndPassword(senha, userFound.senha);
            const userFilter = {email: email};

            if(!verification){
                return {r: false, data: "Senha incorreta!", status: HttpStatus.BAD_REQUEST}
            };
            
            return {
                r: true, 
                data: {
                    userFilter, 
                    token: await this.generateAccessToken({user: userFilter, type: "acces"}), 
                    refreshToken: await this.generateRefreshToken({user: userFilter, type: "refresh"})
                }, 
                status: HttpStatus.ACCEPTED
            };

        }else{
            return {r: false, data: "Usuário não foi encontrado!", status: HttpStatus.BAD_REQUEST};
        };
    };

    public async uploadImage(file, code: string): Promise<response>{
        console.log(file)
        console.log(code)

        if(code != undefined && code.length > 0){
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')

            await axios.post('https://api.dropboxapi.com/oauth2/token', {
                code,
                grant_type: 'authorization_code',
                clientId: "i8p06kgx6l9hvyk",
                clientSecret: "9rfn9d72o3ozhua",
                redirect_uri: "https://www.google.com.br/",
            }).then(res => console.log(res)).catch(err => console.log(err))


            return

            const dropbox = new Dropbox.Dropbox({
                accessToken: "",
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
                return {r: true, data: {url: sharedLink.result.url.replace("?dl=0", "?raw=1"), result}, status: HttpStatus.CREATED}
            }
    
            /* axios.get("https://www.dropbox.com/oauth2/authorize?client_id=i8p06kgx6l9hvyk&response_type=code&redirect_uri=https://www.google.com.br/")
            .then(res => console.log(res)).catch(err => console.) */
    
            return {r: false, data: utils.errorExternalServicesTreatment(result), status: HttpStatus.BAD_REQUEST}
        }

        return {r: true, data: {info: "O login no dropBox é necessário!", url: "https://www.dropbox.com/oauth2/authorize?client_id=i8p06kgx6l9hvyk&response_type=code&redirect_uri=https://www.google.com.br/"}, status: HttpStatus.BAD_REQUEST}


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

    public buscaPorEmailDeUsuario(email: string): Usuario {
        const usuarioEncontrado = this.usuarios.find(usuario => usuario.email == email);

        if(usuarioEncontrado != undefined){
            return {...usuarioEncontrado, exist: true}
        };

        return {...usuarioEncontrado, exist: false};
    };

    public buscaPorNomeDeUsuario(name: string): Usuario {
        const usuarioEncontrado = this.usuarios.find(usuario => usuario.username == name);

        if(usuarioEncontrado != undefined){
            return {...usuarioEncontrado, exist: true}
        };

        return {...usuarioEncontrado, exist: false};
    };
};