import { envs } from "../../config";
import { bcryptAdapter } from "../../config/bcrypt.adapter";
import { JwtAdapter } from "../../config/jwt.adapter";
import { UserModel } from "../../data";
import { CustomError } from "../../domain";
import { LoginUserDto } from "../../domain/dtos/auth/login-user.dto";
import { RegisterUSerDto } from "../../domain/dtos/auth/register-user.dto";
import { UserEntity } from '../../domain/entities/user.entity';
import { EmailService, SendMailOptions } from "./email.service";



export class AuthService {

    constructor(
        private readonly emailService: EmailService,
    ){}

    public async registerUser(registerUserDto: RegisterUSerDto){
        const existUser = await UserModel.findOne({email: registerUserDto.email})

        if(existUser) throw CustomError.badRequest("Email already exit")

        try {
            const user = new UserModel(registerUserDto)

            user.password = bcryptAdapter.hash(registerUserDto.password)

            await user.save()
            this.sendEmailValidationLink(user.email)
            const {password, ...userEntity} = UserEntity.fromObject(user)
            const token = await JwtAdapter.generateJWT({id:user.id})
            if(token===null) throw CustomError.internalServer("Error generating JWT")
            return {...userEntity,token}
        } catch (error) {
            throw CustomError.internalServer(`${error}`)
        }

        return "OK"
    } 

    public async loginUser(loginUserDto: LoginUserDto){
        
        //verificar existencia
        const user = await UserModel.findOne({email: loginUserDto.email})

        if(!user) throw CustomError.badRequest("USER not found")
        //comapareHash Password
        const isMatch = bcryptAdapter.compare(loginUserDto.password, user.password)
        if(!isMatch){
            throw CustomError.unauthorized('Invalid password')
        }
        const {password, ...userEntity}  = UserEntity.fromObject(user)

        const token = await JwtAdapter.generateJWT({id:user.id, email: user.email})
        if(token===null) throw CustomError.internalServer("Error generating JWT")
        return {...userEntity,token}
    } 

    private sendEmailValidationLink = async (email: string) => {
        const token = await JwtAdapter.generateJWT({email})
        if (!token) throw CustomError.internalServer("Error generating Token")

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`
        const html = `
        <h1>VALIDATE YOUR EMAIL</h1>
        <p>CLICK ON THE FOLLOWING TO VALIUDATE YOR EMAIL</p>
        <a href="${link}">Validate your email ${email}</a>
        `

        const options: SendMailOptions = {
            to: email,
            subject: "EMAIL VALIDATION",
            htmlBody: html,
        }

        const isSent = await this.emailService.sendEmail(options)
        
        if(!isSent) throw CustomError.internalServer("Error sending email")

        return true
    }

    public validateEmail = async (token: string) => {

        const payload = await JwtAdapter.validateToken(token)
        if(!payload) throw CustomError.unauthorized("Token Not Valid")
        const {email} = payload as {email:string}

        if(!email) throw CustomError.internalServer("Email Not in Token")

        const user = await UserModel.findOne({email})
        if(!user) throw CustomError.internalServer("Email not exist")

        user.emailValidated = true
        await user.save()

        return true
    }
}