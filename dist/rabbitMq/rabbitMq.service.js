"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const amqplib_1 = require("amqplib");
const Dropbox = require("dropbox");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../mongoDb/user.schema");
const utils_1 = require("../utils/utils");
let RabbitMQService = class RabbitMQService {
    constructor(userModel) {
        this.userModel = userModel;
        this.rabbitMqConsumeErrosUploadImage();
    }
    ;
    async sendToExchange(exchangeName, routingKey, message) {
        const connection = await (0, amqplib_1.connect)(process.env.RABBIT_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(exchangeName, 'direct', { durable: true });
        await channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify({ data: message })));
        await channel.close();
        await connection.close();
    }
    ;
    async rabbitMqConsumeErrosUploadImage() {
        const exchangeName = 'AICORRIGE';
        const queueName = 'QUEUEAICORRIGE';
        const routingKey = 'KEYAICORRIGE';
        const connection = await (0, amqplib_1.connect)(process.env.RABBIT_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(exchangeName, 'direct', { durable: true });
        await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(queueName, exchangeName, routingKey);
        await channel.consume(queueName, async (message) => {
            console.log(message);
            const data = JSON.parse(message.content.toString());
            console.log(data.data);
            channel.ack(message);
            if (Object.keys(data.data.dropbox).length > 0) {
                const dropbox = new Dropbox.Dropbox({
                    accessToken: data.data.dropbox.accessToken,
                    clientId: data.data.dropbox.clientId,
                    clientSecret: data.data.dropbox.clientSecret
                });
                const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({
                    path: data.data.path,
                });
                const userFilter = await this.userModel.findById(data.data.userId).exec().then((doc) => doc === null || doc === void 0 ? void 0 : doc.toObject()).catch((err) => err);
                const user = await this.userModel.findByIdAndUpdate(data.data.userId, { $set: { img: sharedLink.result.url.replace("?dl=0", "?raw=1") } }, { new: true }).exec();
                if (utils_1.utils.verifyCond(user) && data.data.msg == "GENERATE") {
                    if ("img" in userFilter) {
                        const metadata = await dropbox.sharingGetSharedLinkMetadata({ url: userFilter.img });
                        const filePath = metadata.result.path_lower;
                        await dropbox.filesDeleteV2({ path: filePath });
                    }
                    ;
                }
                ;
                console.log("------------");
                console.log(user);
                console.log("------------");
            }
            ;
        });
    }
};
RabbitMQService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RabbitMQService);
exports.RabbitMQService = RabbitMQService;
//# sourceMappingURL=rabbitMq.service.js.map