import { HttpStatus, Injectable } from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { BcryptService } from './bcrypt/bcrypt.service';

@Injectable()
export class UsuarioService {
    private usuarios: Array<Usuario> = [{ 
        id: 1,
        email: 'gabriel.leite@alura.com.br',
        senha: '123456',
        username: "gabrico"
    }];
    
    public async create(usuario: Usuario): Promise<any> {

        if(!this.buscaPorEmailDeUsuario(usuario.email).exist && !this.buscaPorNomeDeUsuario(usuario.username).exist){

            const { email, senha, username } = usuario;
            
            const userFilter = {email: email, senha: await this.setHash(senha), username, id: this.usuarios.length}
            this.usuarios.push(userFilter);
            console.log(userFilter)
            
            return {r: true, data: "Registrado com sucesso!", status: HttpStatus.CREATED};
        }else{

            console.log(this.buscaPorEmailDeUsuario(usuario.email))

            if(this.buscaPorEmailDeUsuario(usuario.email).exist && this.buscaPorNomeDeUsuario(usuario.username).exist){
                return {r: false, data: `E-mail e nome já existem na base de dados!`, status: HttpStatus.BAD_REQUEST};
            }else{
                const emailAndNameExist = this.buscaPorEmailDeUsuario(usuario.email).exist? "E-mail":"Nome"; 
    
                return {r: false, data: `${emailAndNameExist} já existe na base de dados!`, status: HttpStatus.BAD_REQUEST};
            }

        };

    };

    public async login(usuario: Usuario): Promise<any> {

        if(this.buscaPorEmailDeUsuario(usuario.email).exist){

            const userFound = this.buscaPorEmailDeUsuario(usuario.email);

            const { email, senha } = usuario;

            const verification = await this.compareHashedPasswordAndPassword(senha, userFound.senha);
            const userFilter = {email: email};

            if(!verification){
                return {r: false, data: "Senha incorreta!", status: HttpStatus.BAD_REQUEST}
            }
            
            return {r: true, data: userFilter, status: HttpStatus.ACCEPTED};

        }else{
            return {r: false, data: "Usuário não foi encontrado!", status: HttpStatus.BAD_REQUEST};
        }
    };

    //-------------------------------------------------------

    async setHash(password){
        const data = await BcryptService.hashPassword(password);
        return data
    };

    async compareHashedPasswordAndPassword(password, passwordHashed){
        const data = await BcryptService.comparePassword(password, passwordHashed);
        return data
    }

    public buscaPorEmailDeUsuario(email: string): Usuario {
        const usuarioEncontrado = this.usuarios.find(usuario => usuario.email == email);

        if(usuarioEncontrado != undefined){
            return {...usuarioEncontrado, exist: true}
        }

        return {...usuarioEncontrado, exist: false};
    };

    public buscaPorNomeDeUsuario(name: string): Usuario {
        const usuarioEncontrado = this.usuarios.find(usuario => usuario.username == name);

        if(usuarioEncontrado != undefined){
            return {...usuarioEncontrado, exist: true}
        }

        return {...usuarioEncontrado, exist: false};
    };
};