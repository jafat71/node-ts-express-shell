
import { Router } from 'express';
import { FileUploadController } from './controller'; 
import { FileUploadService } from '../services/file-upload.service';
import { FileUploadMiddleware } from '../middlewares/file-upload.middleware';
import { TypeMIddleware } from '../middlewares/type.middleware';

export class FileUploadRoutes {


  static get routes(): Router {

    const router = Router();
    const fileUploadService = new FileUploadService()
    const controller = new FileUploadController(fileUploadService)

    router.use(FileUploadMiddleware.containFiles)
    router.use(TypeMIddleware.checkExtension(['users','products','categories']))


    router.post("/single/:type",controller.uploadFile)
    router.post("/multiple/:type",controller.uploadMultipleFiles)

    return router;
  }


}

