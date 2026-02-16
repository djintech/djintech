import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs'; // Use firstValueFrom with send()

@Controller()
export class ApiController {
  constructor(
    private readonly apiService: ApiService,
    @Inject('FILE_SERVICE') private readonly client: ClientProxy, // Inject the client    
  ) {}

  // @Get('hello')
  // async hello() {
  //   const result = this.client.send({ cmd: 'pattern' }, {});
  //   // Convert the Observable result to a Promise for async handling
  //   return firstValueFrom(result); 
  // }
}
