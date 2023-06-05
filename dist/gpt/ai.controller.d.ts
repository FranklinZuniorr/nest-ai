import { NestResponse } from '../core/http/nest-response';
import { AiService } from './ai.service';
import { Ai } from './ai.entity';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    getAiResponse(text: Ai, accessToken: string): Promise<NestResponse>;
}
