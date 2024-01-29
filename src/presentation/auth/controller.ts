import { Request, Response } from "express";
import { RegisterUSerDto } from "../../domain/dtos/auth/register-user.dto";
import { AuthService } from '../services/auth.service';
import { CustomError } from "../../domain";
import { LoginUserDto } from "../../domain/dtos/auth/login-user.dto";



export class AuthController {
    
    constructor(
        public readonly authservice: AuthService,
    ){}

        private handleError = (error: unknown, res: Response) => {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({error: error.message})
            }
            console.log(error);
            return res.status(500).json({error: "Internal Server Error"})
        }

    registerUser = (req: Request, res: Response) => {

        const [error, registerDto] = RegisterUSerDto.create(req.body)

        if(error) return res.status(400).json({error})
        this.authservice.registerUser(registerDto!)
            .then(user=>res.json(user))
            .catch(error=>this.handleError(error,res))
    }

    loginUser = (req: Request, res: Response) => {

        const [error, loginDto] = LoginUserDto.create(req.body)

        if(error) return res.status(400).json({error})
        this.authservice.loginUser(loginDto!)
            .then(user=>res.json(user))
            .catch(error=>this.handleError(error,res))
    }

    validateEmail = (req: Request, res: Response) => {
        const {token} = req.params

        this.authservice.validateEmail(token)
        .then(()=>res.json("Email Validated"))
        .catch(error=>this.handleError(error,res)) 
    }
}