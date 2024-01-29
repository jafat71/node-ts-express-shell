import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config/jwt.adapter";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain";



export class AuthMiddleware {

    static async validateJWT(req:Request, res:Response, next:NextFunction) {

        const authorization = req.header('Authorization')

        if (!authorization) return res.status(401).json({error: "No token provided"})
        if (!authorization.startsWith('Bearer ')) return res.status(401).json({error:"Invalid Bearer Token"})

        const token = authorization.split(' ').at(1) || ''
        
        try {
        
            const payload = await JwtAdapter.validateToken<{id: string}>(token) //Espera objecto con un id de tipo string
            if (!payload)  return res.status(401).json({error: "Invalid token"})

            const user = await UserModel.findById(payload.id)
            if(!user) return res.status(401).json({error:"Invalid token - user not found"})

            req.body.user = UserEntity.fromObject(user)

            next() // procede con el siguiente middleware /controlador de ruta

        } catch (error) {
            console.log("Erro en validación JWT", error);
            res.status(500).json({error:"Internal Server Error"})
        }
    }

}