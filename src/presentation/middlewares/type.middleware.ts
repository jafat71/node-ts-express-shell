


import { NextFunction, Request, Response } from "express";



export class TypeMIddleware {


    static checkExtension(validTypes: string[]){ //DI

        //FACTORY METHOD -> metodo que crea una función
        return(req: Request, res:Response, next: NextFunction)=>{
            const type = req.url.split('/').at(2 ?? '') // /:type ruta
    
            if(!validTypes.includes(type!)){
                return res.status(400).json({error: "invalid type: " + type + ", valid ones " + validTypes})
    
            }
    
            next()
        }

    }
}