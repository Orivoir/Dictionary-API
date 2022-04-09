import { Controller, Get, Param, Response } from '@nestjs/common';
import { ApiService } from './api.service';
import fetch, { Response as ClientResponse } from 'node-fetch';
import { Response as AgnosticResponse } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller('api')
export class ApiController {
  constructor(private apiService: ApiService) {}

  @ApiOkResponse({
    description: 'Get data with success',
  })
  @ApiNotFoundResponse({
    description: 'word not find for target corpus',
  })
  @ApiBadRequestResponse({
    description: 'invalid params corpus or word',
  })
  @Get('/word/:corpus/:word')
  word(
    @Param('corpus') corpus: string,
    @Param('word') word: string,
    @Response() nativeResponse: AgnosticResponse,
  ) {
    if (corpus.length != 2) {
      nativeResponse.statusCode = StatusCodes.BAD_REQUEST;

      nativeResponse.json({
        success: false,
        message: ReasonPhrases.BAD_REQUEST,
        details:
          'corpus params should be a ISO 3166-1 alpha-2 in two letters see (https://en.wikipedia.org/wiki/ISO_3166-2)',
      });

      return;
    }

    word = word.split(' ')[0];

    const PATTERN_WORD = /^[a-zA-Z]{1,}$/;

    if (!PATTERN_WORD.test(word)) {
      nativeResponse.statusCode = StatusCodes.BAD_REQUEST;

      nativeResponse.json({
        success: false,
        message: ReasonPhrases.BAD_REQUEST,
        details: 'word params should contains only letters',
      });

      return;
    }

    const endpoint = this.apiService.createUrl(
      encodeURIComponent(word),
      corpus,
    );

    fetch(endpoint, {
      method: 'GET',
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': this.apiService.getUserAgent(),
      },
    })
      .then(
        (clientResponse: ClientResponse) => clientResponse.text(), // endpoint provide "non-valid" JSON format
      )
      .then((responseText: string): void => {
        responseText = responseText.substring(4); // remove invalid chars

        let responseJSON = null;
        try {
          responseJSON = JSON.parse(responseText);

          const payload = responseJSON['feature-callback'].payload;
          const result = payload.single_results[0]?.entry;

          nativeResponse.statusCode = 200;

          // unwrap data:

          const responseData = {
            success: true,

            word: result.headword,
            corpus: payload.answer_corpus,

            definition:
              result?.sense_families[0]?.senses[0]?.definition?.text ||
              result?.sense_families[0]?.senses[0]?.definition?.fragments
                ?.map((coreText) => coreText.text)
                ?.join('\n') ||
              'unknown',

            synonyms: result?.sense_families[0]?.senses[0]?.synonyms?.map(
              (nyms) => ({
                word: nyms[0]?.nym,
                definition: nyms[0]?.snippet?.definition,
                example: nyms[0]?.snippet?.example,
              }),
            ),
          };

          result?.inflections_result?.noun_forms?.forEach((element) => {
            responseData[element.features.number?.toLocaleLowerCase()] = {
              gender: element.features.gender,
              number: element.features.number,
              word: element['form_text'],
            };
          });

          if (typeof result?.etymology?.etymology?.text === 'string') {
            responseData['etymology'] = result?.etymology?.etymology?.text;
          }

          if (typeof result?.note === 'object') {
            responseData['note'] = result?.note;
          }

          if (
            result['phonetics'] instanceof Array &&
            !result['phonetics'].find((pho) => pho.tts_audio_enabled)
          ) {
            responseData['phonetics'] = result['phonetics'];
          }

          nativeResponse.json(responseData);
        } catch (syntaxError) {
          if (this.apiService.getEnv() === 'dev') {
            nativeResponse.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            nativeResponse.json({
              success: false,
              message: ReasonPhrases.INTERNAL_SERVER_ERROR,
              details: `Syntax Error during parse content from endpoint with: ${syntaxError.message}`,
            });
          } else {
            // mute in 404 Not Found in prod
            nativeResponse.statusCode = StatusCodes.NOT_FOUND;
            nativeResponse.json({
              success: false,
              message: ReasonPhrases.NOT_FOUND,
              details: `never ressource find for word: ${word}`,
            });
          }
        }
      })
      .catch((networkError: Error): void => {
        nativeResponse.statusCode = StatusCodes.BAD_GATEWAY;
        nativeResponse.json({
          success: false,
          message: ReasonPhrases.BAD_GATEWAY,
          details:
            this.apiService.getEnv() === 'dev'
              ? networkError.message // show server error in dev env
              : 'network error, try again later', // hide details error in prod env
        });
      });
  }
}
