import { HttpStatus, Injectable } from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { BcryptService } from './bcrypt/bcrypt.service';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import * as Dropbox from 'dropbox';
import { AuthService } from './accessTokenAndRefreshToken/AuthService';
import { JwtService } from '@nestjs/jwt';
import { accessDto, refreshDto } from './accessTokenAndRefreshToken/refreshAndAccessDto';
interface response{
    r: boolean,
    data: any,
    status: number
}

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

    private dropbox = new Dropbox.Dropbox({
        accessToken: process.env.DROPBOX_KEY,
    });
    
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

    public async verifyRefreshTokenAndGenerateTokens(refreshToken: refreshDto): Promise<response>{

        const verify = await this.verifyToken(refreshToken.refreshToken, "refresh");

        if(verify.name === 'TokenExpiredError') {
            return {
                r: false, 
                data: {...verify, name: "RefreshTokenExpiredError"},
                status: HttpStatus.BAD_REQUEST
            }
        }

        return {
            r: true, 
            data: {
                token: await this.generateAccessToken({user: verify.user.email, type: "acces"}), 
                refreshToken: await this.generateRefreshToken({user: verify.user.email, type: "refresh"})
            }, 
            status: HttpStatus.ACCEPTED
        };
    }

    public async verifyAccessTokenPass(accessToken: string): Promise<response>{

        
        if(accessToken != ""){

            const verify = await this.verifyToken(accessToken, "access");
            console.log(verify)
                
    
            if(verify.name === 'TokenExpiredError') {
                return {
                    r: false, 
                    data: "AccessTokenExpiredError",
                    status: HttpStatus.BAD_REQUEST
                }
            }

            if(verify.name === "JsonWebTokenError"){
                return {
                    r: false, 
                    data: "JsonWebTokenError",
                    status: HttpStatus.BAD_REQUEST
                }
            }
    
            return {
                r: true, 
                data: "AccessTokenOk", 
                status: HttpStatus.ACCEPTED
            };

        }

        return {
            r: false, 
            data: "Nenhum accessToken encontrado",
            status: HttpStatus.BAD_REQUEST
        }

    }

    public async uploadImage(file): Promise<response>{
        console.log(file)

        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')

        const result = await this.dropbox.filesUpload({
        path: `/${randomName}${extname(file.originalname)}`,
        contents: file.buffer,
        })
        
        if(result.status == 200){
            const sharedLink = await this.dropbox.sharingCreateSharedLinkWithSettings({
                path: result.result.path_display,
            });
            return {r: true, data: {url: sharedLink.result.url.replace("?dl=0", "?raw=1"), result}, status: HttpStatus.CREATED}
        }

        return {r: false, data: "", status: HttpStatus.BAD_REQUEST}

    }

    //-------------------------------------------------------

    async setHash(password){
        const data = await BcryptService.hashPassword(password);
        return data
    };

    async compareHashedPasswordAndPassword(password, passwordHashed){
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