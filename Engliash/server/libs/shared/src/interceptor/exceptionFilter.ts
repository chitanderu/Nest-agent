import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch(HttpException)
export class InterceptorExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const request = ctx.getRequest()
        const response = ctx.getResponse()
        response.status(exception.getStatus()).json({
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.message,
            code: exception.getStatus(),
            success: false
        })
    }
}