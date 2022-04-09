import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiService {
  constructor(private configService: ConfigService) {}

  getEnv() {
    return this.configService.get<string>('NODE_ENV');
  }

  createUrl(word: string, local: string): string {
    const baseUrl = this.configService.get<string>('ENDPOINT_URL');
    const endpointServiceKeyname = this.configService.get<string>(
      'ENDPOINT_SERVICE_KEYNAME',
    );
    const endpointServiceId = this.configService.get<string>(
      'ENDPOINT_SERVICE_ID',
    );
    const endpointFcv = this.configService.get<string>('ENDPOINT_FCV');
    const endpointEndl = this.configService.get<string>('ENDPOINT_ENDL');

    return `${baseUrl}?${endpointServiceKeyname}=${endpointServiceId}&fcv=${endpointFcv}&async=term:${encodeURIComponent(
      word,
    )},corpus:${local},${endpointEndl}`;
  }

  getUserAgent() {
    return this.configService.get<string>('ENDPOINT_SAFE_USER_AGENT');
  }
}
