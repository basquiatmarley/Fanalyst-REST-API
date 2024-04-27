import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';

import {AuthenticationComponent} from '@loopback/authentication';
import {JWTAuthenticationComponent, UserServiceBindings} from '@loopback/authentication-jwt';
import multer from 'multer';
import {MysqldbDataJuglerSource} from './datasources';
import {FILE_UPLOAD_SERVICE, STORAGE_DIRECTORY} from './keys';
import {MySequence} from './sequence';
import {EMAIL_SERVICE, EmailService} from './services/mailers.service';

export {ApplicationConfig};

export class FanalystApiLbApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);


    // Configure file upload with multer options
    this.configureFileUpload(options.fileStorageDirectory);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // Bind datasource
    this.dataSource(MysqldbDataJuglerSource, UserServiceBindings.DATASOURCE_NAME);

    this.bind(EMAIL_SERVICE).toClass(EmailService);


  }
  protected configureFileUpload(destination?: string) {
    // Upload files to `dist/.sandbox` by default
    destination = destination ?? path.join(__dirname, '../public/.sandbox');
    this.bind(STORAGE_DIRECTORY).to(destination);
    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        // Use the original file name as is
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const extension = path.extname(file.originalname); // Preserve the file extension
          const nameWithoutExtension = path.basename(file.originalname, extension);
          cb(null, `${nameWithoutExtension}-${uniqueSuffix}${extension}`);

        },
      }),
    };
    // Configure the file upload service with multer options
    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}
