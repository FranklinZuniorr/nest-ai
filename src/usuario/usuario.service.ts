import { Injectable } from '@nestjs/common';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuarioService {
    private usuarios: Array<Usuario> = [{ 
        id: 1,
        email: 'gabriel.leite@alura.com.br',
        senha: '123456',
    }];
    
    public cria(usuario: Usuario): Usuario {
        const usuarioFiltro = {email: usuario.email, senha: usuario.senha, id: this.usuarios.length}
        this.usuarios.push(usuarioFiltro);
        console.log(usuarioFiltro)
        
        return usuarioFiltro;
    }

    public buscaPorNomeDeUsuario(email: string): Usuario {
        const usuarioEncontrado = this.usuarios.find(usuario => usuario.email == email);

        return usuarioEncontrado;
    }
}