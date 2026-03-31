import { Controller, Get, Inject } from '@nestjs/common';

@Controller()
export class ApiController {
  constructor(
  ) {}

  // @Get('hello')
  // async hello() {
  //   const result = this.client.send({ cmd: 'pattern' }, {});
  //   // Convert the Observable result to a Promise for async handling
  //   return firstValueFrom(result);
  // }
}
