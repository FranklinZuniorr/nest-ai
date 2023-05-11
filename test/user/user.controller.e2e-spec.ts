import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection, connect, Model } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "src/mongoDb/user.schema";
import { UserSchema } from "src/mongoDb/user.schema";
import { UsuarioController } from "src/usuario/user.controller";
import { UsuarioService } from "src/usuario/user.service";
import { Usuario } from "src/usuario/user.entity";
import * as request from 'supertest';
import { HttpStatus } from "@nestjs/common";
import { AuthService } from "src/usuario/accessTokenAndRefreshToken/AuthService";
import { UsuarioEdit } from "src/usuario/user.entity.edit";
import * as fs from 'fs';
import { response } from "src/core/http/responseDto/response";
import { JwtService } from "@nestjs/jwt";
import { VerifyTokenInterceptor } from "src/core/http/verify-token-interceptor";

require("dotenv").config("./.env")

describe("AppController", () => {
  let appController: UsuarioController;
  let mongodb: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let responseInterface: response;
  let appReq;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        UsuarioService,
        AuthService,
        JwtService,
        VerifyTokenInterceptor,
        {provide: getModelToken(User.name), useValue: userModel},
      ],
    }).compile();
    appReq = app.createNestApplication();
    await appReq.init();
    appController = app.get<UsuarioController>(UsuarioController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongodb.stop();
    appReq.close();
  });

  afterEach(async () => {
    /* const collections = mongoConnection.collections;
    console.log(await collections)
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    } */
  })

  beforeEach(() => {
    responseInterface = {
      r: expect.any(Boolean),
      data: expect.anything(),
      status: expect.any(Number),
    };
  });

  describe('user-controller', () => {
    it('Should create a user and return a response with the correct interface', async () => {
      const user: Usuario = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      };

      const response = appController.createUser(user);

      expect((await response).status).toBe(HttpStatus.CREATED);
      expect((await response).body).toMatchObject(responseInterface);
    });

    let token;

    it('Should login a user and return a response with the correct interface', async () => {
        const user: Usuario = {
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123'
        };
  
        const response = await appController.loginUser(user);
        console.log((await response).body)
        token = response.body;
  
        expect((await response).status).toBe(HttpStatus.ACCEPTED);
        expect((await response).body).toMatchObject(responseInterface);
    });

    it('Should edit a user and return a response with the correct interface', async () => {
        const user: UsuarioEdit = {
            username: 'testedivcxt'
        };

        console.log(token.data.token)

        const response = appController.editUser(user, token.data.token);
        console.log((await response).body)
        expect((await response).status).toBe(HttpStatus.OK);
        expect((await response).body).toMatchObject(responseInterface);
    })

    it('Should send a image for user profile and return a response with the correct interface', async () => {
      const response = request(appReq.getHttpServer())
      .post('/upload-image')
      .set('accessToken', token.data.token)

      const data = {
        status: (await response).body.status,
        body: (await response).body.body
      };
      
      console.log((await response).body.body)
      expect(data.status).toBe(HttpStatus.ACCEPTED);
      expect(data.body).toMatchObject(responseInterface);
    });

    it('Should send a request email password change and return a response with the correct interface', async () => {
        const reqData = {
            email: "testuser@example.com"
        };

        const response = request(appReq.getHttpServer())
        .post('/forget-password')
        .send(reqData)
  
        const data = {
          status: (await response).body.status,
          body: (await response).body.body
        };
        
        console.log((await response).body.body)
        expect(data.status).toBe(HttpStatus.OK);
        expect(data.body).toMatchObject(responseInterface);
    });

    it('Should send a refreshToken and return a response with the correct interface', async () => {
        const reqData = {
            refreshToken: token.data.refreshToken
        };

        const response = request(appReq.getHttpServer())
        .post('/refresh-token')
        .send(reqData)
  
        const data = {
          status: (await response).body.status,
          body: (await response).body.body
        };
        
        console.log((await response).body.body)
        expect(data.status).toBe(HttpStatus.ACCEPTED);
        expect(data.body).toMatchObject(responseInterface);
    });

  });


})