import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Header, Headers } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';

@Controller('/')
export class UsuarioController {

    constructor(private usuarioService: UsuarioService) {}

   /*  @Get(':emailDeUsuario')
    public buscaPorEmailDeUsuario(@Param('emailDeUsuario') emailDeUsuario: string): Usuario {
        const usuarioEncontrado = this.usuarioService.buscaPorEmailDeUsuario(emailDeUsuario);

        if (!usuarioEncontrado) {
            throw new NotFoundException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Usuário não encontrado.'
            });
        }
        return usuarioEncontrado;
    } */

    @Post('new-user')
    public async createUser(@Body() usuario: Usuario): Promise<NestResponse> {
        
        const usuarioCriado = await this.usuarioService.create(usuario);
        console.log(usuarioCriado);

        return new NestResponseBuilder()
                .comStatus(usuarioCriado.status)
                .comHeaders({
                    'Location': `/users/${usuarioCriado.email}`
                })
                .comBody(usuarioCriado)
                .build();

    };

    @Post('login')
    public async loginUser(@Body() usuario: Usuario): Promise<NestResponse> {

        const userLogged = await this.usuarioService.login(usuario);

        return new NestResponseBuilder()
        .comStatus(userLogged.status)
        .comHeaders({
            'Location': `/users/${userLogged.email}`
        })
        .comBody(userLogged)
        .build();

    }
}