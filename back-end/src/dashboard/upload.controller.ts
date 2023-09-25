import { Controller, Post, UseInterceptors, UploadedFile, Header, Req, UseGuards } from "@nestjs/common";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage} from 'multer';
import { JwtAuthGuard } from "src/auth/guards/jwt-aut.guard";
import { UserCrudService } from "src/prisma/user-crud.service";


@Controller('upload')
export class UploadController
{
    constructor(private readonly user : UserCrudService){};
    @Post('file')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (rep, file, cb) => {
                    const parts = file.originalname.split('.');
                    const fileExtension = parts.pop();
                    const name = parts.join('.');
                    const uniqueSuffix = name.split(' ').join('_') + '_' + Date.now() + '.' + fileExtension;
                    cb(null, uniqueSuffix);
                },
            }),
        }),
    )
    
    async uploadFile(@UploadedFile() file, @Req() request:  Request)
    {
        console.log('IM here');
        try {
            // const authorizationHeader = request.headers['Authorization'];
            // if (authorizationHeader)
            // {
            //     // this.user.changeUserAvatar()
            //     console.log('auth : ', authorizationHeader.inputsearch);
            // }
            // this.user.changeUserAvatar()
            console.log('uploa file : ', file.filename);
            return { filename: file.filename };
        } catch (error) {
            console.error('Error during file upload:', error);
            throw ('File upload failed');
        }
    }
}