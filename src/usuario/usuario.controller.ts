import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Header, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import * as Dropbox from 'dropbox';

@Controller('/')
export class UsuarioController {

    private dropbox = new Dropbox.Dropbox({
        accessToken: 'sl.Bdv_0UHXe0q7Hw_BdQ6xUIhG6eykpAiWTc6V7DqaTtNexqknQ41pwRkgpdkWbfICEQUmhugR1OqUcGJzQBusmpV0v80LppEBAubdniqKjIbnR0wt0pY9NmkHze3r4wcEx4fSKRvNmxk_',
    });

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

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file' , {
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return callback(new Error('Só imagens são permitidas!'), false);
            }
            callback(null, true);
        },
    }))
    async upload(@UploadedFile() file) {
        console.log(file)

        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')

        const result = await this.dropbox.filesUpload({
        path: `/${randomName}${extname(file.originalname)}`,
        contents: file.buffer,
        });

        const sharedLink = await this.dropbox.sharingCreateSharedLinkWithSettings({
            path: result.result.path_display,
        });
        
        return {result, url: sharedLink.result.url.replace("?dl=0", "?raw=1")};
    }

    /* @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
        preservePath: true,
        fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
        },
    }))
    async upload(@UploadedFile() file) {
        
        console.log(file)

        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')

        const result = await this.dropbox.filesUpload({
        path: `/${randomName}${extname(file.originalname)}`,
        contents: file.buffer,
        });
        return result;
    } */


    /* @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
            return callback(null, `${randomName}${extname(file.originalname)}`)
        },
        }),
        preservePath: true // Configuração para manter o caminho original do arquivo
    }))
    async upload(@UploadedFile() file) {
        const result = await this.dropbox.filesUpload({
        path: `/${file.originalname}`,
        contents: file.buffer,
        });

        return result;
    } */
}

const usuarioService = new UsuarioService();
const teste = new UsuarioController(usuarioService);