import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection, connect, Model } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "src/mongoDb/user.schema";
import { UserSchema } from "src/mongoDb/user.schema";
import { UsuarioController } from "src/usuario/usuario.controller";
import { UsuarioService } from "src/usuario/usuario.service";
import { Usuario } from "src/usuario/usuario.entity";
import * as request from 'supertest';
import { HttpStatus } from "@nestjs/common";
import { response } from "src/responseDto/response";

require("dotenv").config("./.env")

describe("AppController", () => {
  let appController: UsuarioController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let articleModel: Model<User>;
  let responseInterface: response;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    articleModel = mongoConnection.model(User.name, UserSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        UsuarioService,
        {provide: getModelToken(User.name), useValue: articleModel},
      ],
    }).compile();
    appController = app.get<UsuarioController>(UsuarioController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
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

      const response = appController.createUser(user)

      expect((await response).status).toBe(HttpStatus.CREATED);
      expect((await response).body).toMatchObject(responseInterface);
    });

    it('Should login a user and return a response with the correct interface', async () => {
        const user: Usuario = {
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
        };
  
        const response = appController.loginUser(user)
  
        expect((await response).status).toBe(HttpStatus.ACCEPTED);
        expect((await response).body).toMatchObject(responseInterface);
      });
  });

})