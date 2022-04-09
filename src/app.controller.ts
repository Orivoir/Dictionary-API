import { Controller, Get, Response } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response as AgnosticResponse } from 'express';
import { StatusCodes } from 'http-status-codes';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  home(): string {
    // @TODO: make home page
    return 'Hello World';
  }

  @Get('/doc')
  doc(@Response() nativeResponse: AgnosticResponse) {
    // redirect at swagger UI documentation auto generated
    nativeResponse.redirect(StatusCodes.PERMANENT_REDIRECT, '/api');
  }
}
