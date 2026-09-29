import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterLandlordDto,
  RegisterStudentDto,
  ResetPasswordDto,
  VerifyUniversityDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/student')
  @ApiOperation({ summary: 'Register as a student' })
  @ApiResponse({ status: 201, description: 'Student registered successfully' })
  async registerStudent(@Body() dto: RegisterStudentDto) {
    const user = await this.authService.registerStudent(dto);
    return { data: { user }, success: true };
  }

  @Post('register/landlord')
  @ApiOperation({ summary: 'Register as a landlord' })
  @ApiResponse({ status: 201, description: 'Landlord registered successfully' })
  async registerLandlord(@Body() dto: RegisterLandlordDto) {
    const user = await this.authService.registerLandlord(dto);
    return { data: { user }, success: true };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@Request() req: any) {
    return { data: { user: req.user }, success: true };
  }

  @Post('verify-email/:token')
  @ApiOperation({ summary: 'Verify student email with token' })
  async verifyEmail(@Param('token') _token: string) {
    const result = await this.authService.verifyStudentEmail(_token);
    return { data: result, success: true };
  }

  @Post('verify-university')
  @ApiOperation({ summary: 'Submit university verification' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async verifyUniversity(@Body() dto: VerifyUniversityDto, @Request() req: any) {
    const result = await this.authService.verifyStudentUniversity(req.user.id, dto.studentId);
    return { data: result, success: true };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return { data: await this.authService.requestPasswordReset(dto.email), success: true };
  }

  @Post('reset-password/:token')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
    return { data: await this.authService.resetPassword(token, dto.password), success: true };
  }
}
