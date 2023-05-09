import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Header, Headers, UseInterceptors, UploadedFile, Query, Put, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { FileInterceptor } from '@nestjs/platform-express';
import { accessDto, refreshDto } from './accessTokenAndRefreshToken/refreshAndAccessDto';
import { UsuarioEdit } from './usuario.entity.edit';
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
        
        const userCreated = await this.usuarioService.create(usuario);
        console.log(userCreated);

        return new NestResponseBuilder()
        .comStatus(userCreated.status)
        .comHeaders({
            'Info': userCreated.r
        })
        .comBody(userCreated)
        .build();

    };

    @Put('edit-user')
    public async editUser(@Body() usuario: UsuarioEdit, @Headers('accessToken') accessToken: string): Promise<NestResponse>{

        const dataVerifyAccessToken = await this.usuarioService.verifyAccessTokenPass(accessToken);

        if(dataVerifyAccessToken.r){
            const data = await this.usuarioService.edit(accessToken, usuario);
    
            return new NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
                'Info': data.r
            })
            .comBody(data)
            .build();
        };

        return new NestResponseBuilder()
        .comStatus(dataVerifyAccessToken.status)
        .comHeaders({
            'Info': dataVerifyAccessToken.r
        })
        .comBody(dataVerifyAccessToken)
        .build();

    };

    @Delete('delete-user')
    public async removeUser(@Headers('accessToken') accessToken: string): Promise<NestResponse>{

        const dataVerifyAccessToken = await this.usuarioService.verifyAccessTokenPass(accessToken);

        if(dataVerifyAccessToken.r){
            const data = await this.usuarioService.delete(accessToken);
    
            return new NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
                'Info': data.r
            })
            .comBody(data)
            .build();
        };

        return new NestResponseBuilder()
        .comStatus(dataVerifyAccessToken.status)
        .comHeaders({
            'Info': dataVerifyAccessToken.r
        })
        .comBody(dataVerifyAccessToken)
        .build();

    };

    @Post('login')
    public async loginUser(@Body() usuario: Usuario): Promise<NestResponse> {

        const userLogged = await this.usuarioService.login(usuario);

        return new NestResponseBuilder()
        .comStatus(userLogged.status)
        .comHeaders({
            'Info': userLogged.r
        })
        .comBody(userLogged)
        .build();

    };

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file' , {
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return callback(new Error('Só imagens são permitidas!'), false);
            }
            callback(null, true);
        },
    }))
    async upload(@UploadedFile() file, @Headers('accessToken') accessToken: string, @Query('code') code: string): Promise<NestResponse> {

        const dataVerifyAccessToken = await this.usuarioService.verifyAccessTokenPass(accessToken);

        if(dataVerifyAccessToken.r){
            console.log("Acces OK")
            const data = await this.usuarioService.uploadImage(file, code, accessToken);
    
            return new NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
                'Info': data.r
            })
            .comBody(data)
            .build();
        };

        return new NestResponseBuilder()
        .comStatus(dataVerifyAccessToken.status)
        .comHeaders({
            'Info': dataVerifyAccessToken.r
        })
        .comBody(dataVerifyAccessToken)
        .build();

    };

    @Post('refresh-token')
    async verifyRefreshToken(@Body() refreshToken: refreshDto): Promise<NestResponse>{
        const data = await this.usuarioService.verifyRefreshTokenAndGenerateTokens(refreshToken);

        return new NestResponseBuilder()
        .comStatus(data.status)
        .comHeaders({
            'Info': data.r
        })
        .comBody(data)
        .build();
    };

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