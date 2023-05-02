import { Injectable } from '@nestjs/common';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuarioService {
    private usuarios: Array<Usuario> = [{ 
        id: 1,
        email: 'gabriel.leite@alura.com.br',
        senha: '123456',
    }];
    
    public cria(usuario: Usuario): any {

        if(!this.buscaPorEmailDeUsuario(usuario.email)){
            const usuarioFiltro = {email: usuario.email, senha: usuario.senha, id: this.usuarios.length}
            this.usuarios.push(usuarioFiltro);
            console.log(usuarioFiltro)
            
            return {r: true, data: "Registrado com sucesso!"};
        }else{
            return {r: false, data: "E-mail já existe na base de dados!"};
        }

    }

    public buscaPorEmailDeUsuario(email: string): Usuario {
        const usuarioEncontrado = this.usuarios.find(usuario => usuario.email == email);

        return usuarioEncontrado;
    }
}