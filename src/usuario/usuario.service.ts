import { Injectable } from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { BcryptService } from './bcrypt/bcrypt.service';

@Injectable()
export class UsuarioService {
    private usuarios: Array<Usuario> = [{ 
        id: 1,
        email: 'gabriel.leite@alura.com.br',
        senha: '123456',
    }];
    
    public async cria(usuario: Usuario): Promise<any> {

        if(!this.buscaPorEmailDeUsuario(usuario.email)){

            const { email, senha } = usuario;
            
            const usuarioFiltro = {email: email, senha: await this.setHash(senha), id: this.usuarios.length}
            this.usuarios.push(usuarioFiltro);
            console.log(usuarioFiltro)
            
            return {r: true, data: "Registrado com sucesso!"};
        }else{
            return {r: false, data: "E-mail já existe na base de dados!"};
        }

    }

    async setHash(password){
        const data = await BcryptService.hashPassword(password);
        return data
    }

    public buscaPorEmailDeUsuario(email: string): Usuario {
        const usuarioEncontrado = this.usuarios.find(usuario => usuario.email == email);

        return usuarioEncontrado;
    }
}