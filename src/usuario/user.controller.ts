import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Header, Headers, UseInterceptors, UploadedFile, Query, Put, Delete, UseGuards, Patch } from '@nestjs/common';
import { UsuarioService } from './user.service';
import { UserDto } from './user.entity';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessDto, RefreshDto } from './accessTokenAndRefreshToken/refreshAndAccessDto';
import { UserEdit } from './user.entity.edit';
import { Email } from './email.entity';
import { JwtMiddleware } from 'src/core/http/verify-token-middleware';
import { VerifyTokenInterceptor } from 'src/core/http/verify-token-interceptor';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { UserLogin } from './user.entity.login';
import { UserQueries } from './user.entity.queries';
import { UserTop10 } from './user.entity.top10';
import { ExternalUrl } from './user.entity.externalUrl';

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
    public async createUser(@Body() usuario: UserDto): Promise<NestResponse> {
        
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

    @Patch('edit-user')
    @UseInterceptors(VerifyTokenInterceptor)
    public async editUser(@Body() usuario: UserEdit, @Headers('accessToken') accessToken: string): Promise<NestResponse>{

        /* const dataVerifyAccessToken = await this.usuarioService.verifyAccessTokenPass(accessToken); */

        /* if(dataVerifyAccessToken.r){ */
            const data = await this.usuarioService.edit(accessToken, usuario);
    
            return new NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
                'Info': data.r
            })
            .comBody(data)
            .build();
        /* }; */

        /* return new NestResponseBuilder()
        .comStatus(dataVerifyAccessToken.status)
        .comHeaders({
            'Info': dataVerifyAccessToken.r
        })
        .comBody(dataVerifyAccessToken)
        .build(); */

    };

    @Delete('delete-user')
    @UseInterceptors(VerifyTokenInterceptor)
    public async removeUser(@Headers('accessToken') accessToken: string): Promise<NestResponse>{

        /* const dataVerifyAccessToken = await this.usuarioService.verifyAccessTokenPass(accessToken); */

        /* if(dataVerifyAccessToken.r){ */
            const data = await this.usuarioService.delete(accessToken);
    
            return new NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
                'Info': data.r
            })
            .comBody(data)
            .build();
        /* }; */

        /* return new NestResponseBuilder()
        .comStatus(dataVerifyAccessToken.status)
        .comHeaders({
            'Info': dataVerifyAccessToken.r
        })
        .comBody(dataVerifyAccessToken)
        .build(); */

    };

    @Post('forget-password')
    public async forgetPassword(@Body() email: Email){
        const data = await this.usuarioService.editPassword(email);

        return new NestResponseBuilder()
        .comStatus(data.status)
        .comHeaders({
            'Info': data.r
        })
        .comBody(data)
        .build();
    };

/*     @MessagePattern('teste')
    async handleMessage(@Payload() data: any, @Ctx() context: RmqContext, ack: () => void): Promise<void> {
      console.log('Received message:', data);
      
      try {
        
          context.getChannelRef().ack(context.getMessage())
        
      } catch (error) {
        console.log(error)
      }
    }

    @EventPattern({ exchange: 'testeex', routingKey: 'teste' })
    async handleMessag2(@Payload() data: any, @Ctx() context: RmqContext, ack: () => void): Promise<void> {
        console.log('Received message:', data);
      
        try {
          
            context.getChannelRef().ack(context.getMessage())
          
        } catch (error) {
          console.log(error)
        }
    } */

    @Post('login')
    public async loginUser(@Body() usuario: UserLogin): Promise<NestResponse> {

        const userLogged = await this.usuarioService.login(usuario);

        return new NestResponseBuilder()
        .comStatus(userLogged.status)
        .comHeaders({
            'Info': userLogged.r
        })
        .comBody(userLogged)
        .build();

    };

    @Post('logout')
    @UseInterceptors(VerifyTokenInterceptor)
    public async logoutUser(@Headers('accessToken') accessToken: string): Promise<NestResponse> {
        const userLogged = await this.usuarioService.logout(accessToken);

        return new NestResponseBuilder()
        .comStatus(userLogged.status)
        .comHeaders({
            'Info': userLogged.r
        })
        .comBody(userLogged)
        .build();
    };

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file'), VerifyTokenInterceptor)
    async upload(@UploadedFile() file, @Headers('accessToken') accessToken: string, @Query('code') code: string): Promise<NestResponse> {

        /* const dataVerifyAccessToken = await this.usuarioService.verifyAccessTokenPass(accessToken); */

        /* if(dataVerifyAccessToken.r){ */
            console.log("Acces OK")
            const data = await this.usuarioService.uploadImage(file, code, accessToken);
    
            return new NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
                'Info': data.r
            })
            .comBody(data)
            .build();
        /* }; */

        /* return new NestResponseBuilder()
        .comStatus(dataVerifyAccessToken.status)
        .comHeaders({
            'Info': dataVerifyAccessToken.r
        })
        .comBody(dataVerifyAccessToken)
        .build(); */

    };

    @Post('refresh-token')
    async verifyRefreshToken(@Body() refreshToken: RefreshDto): Promise<NestResponse>{
        const data = await this.usuarioService.refreshToken(refreshToken);

        return new NestResponseBuilder()
        .comStatus(data.status)
        .comHeaders({
            'Info': data.r
        })
        .comBody(data)
        .build();
    };

    @Post('access-token')
    async verifyAccessToken(@Body() accessToken: AccessDto): Promise<NestResponse>{
        const data = await this.usuarioService.accessToken(accessToken.accessToken);

        return new NestResponseBuilder()
        .comStatus(data.status)
        .comHeaders({
            'Info': data.r
        })
        .comBody(data)
        .build();
    };

    @Post('upload-queries')
    @UseInterceptors(VerifyTokenInterceptor)
    async uploadQueries(@Headers('accessToken') accessToken: string, @Body() body: UserQueries): Promise<NestResponse>{
        const data = await this.usuarioService.uploadQueries(accessToken, body);

        return new NestResponseBuilder()
        .comStatus(data.status)
        .comHeaders({
            'Info': data.r
        })
        .comBody(data)
        .build();
    };

    @Get('get-top-10')
    @UseInterceptors(VerifyTokenInterceptor)
    async getTop10(@Body() body: UserTop10): Promise<NestResponse>{
        const data = await this.usuarioService.getTop10(body);

        return new NestResponseBuilder()
        .comStatus(data.status)
        .comHeaders({
            'Info': data.r
        })
        .comBody(data)
        .build();
    };

    @Post('set-external-url')
    @UseInterceptors(VerifyTokenInterceptor)
    async setExternalUrl(@Body() body: ExternalUrl, @Headers('accessToken') accessToken: string): Promise<NestResponse>{
        const data = await this.usuarioService.setExternalUrl(accessToken, body);

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