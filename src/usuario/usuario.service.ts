import { HttpStatus, Injectable } from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { BcryptService } from './bcrypt/bcrypt.service';

@Injectable()
export class UsuarioService {
    private usuarios: Array<Usuario> = [{ 
        id: 1,
        email: 'gabriel.leite@alura.com.br',
        senha: '123456',
    }];
    
    public async create(usuario: Usuario): Promise<any> {

        if(!this.buscaPorEmailDeUsuario(usuario.email)){

            const { email, senha } = usuario;
            
            const userFilter = {email: email, senha: await this.setHash(senha), id: this.usuarios.length}
            this.usuarios.push(userFilter);
            console.log(userFilter)
            
            return {r: true, data: "Registrado com sucesso!", status: HttpStatus.CREATED};
        }else{
            return {r: false, data: "E-mail já existe na base de dados!", status: HttpStatus.BAD_REQUEST};
        };

    };

    public async login(usuario: Usuario): Promise<any> {

        if(this.buscaPorEmailDeUsuario(usuario.email)){

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

        return usuarioEncontrado;
    };
};