// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class ApiService {
//   getHello(): string {
//     return 'Hello World!';
//   }
// }
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiService {
  constructor(@Inject('FILE_SERVICE') private readonly client: ClientProxy) {}

  async getHelloFromFiles(): Promise<any> {
    // отправляем команду TCP микросервису
    try {
      //const res =  await firstValueFrom(this.fileClient.send({ cmd: 'pattern' }, {}));
      //return res.message;
      return this.client.send('pattern', {})

    } catch (err) {
      console.error('Error calling Files microservice:', err);
      return 'Error '+ err;
    }
  }
}
