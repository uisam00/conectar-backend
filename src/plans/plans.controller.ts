import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { QueryPlanDto } from './dto/query-plan.dto';
import { PlanDto } from './dto/plan.dto';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';

@ApiTags('Plans')
@ApiBearerAuth()
@Controller({
  path: 'plans',
  version: '1',
})
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Create a new plan (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully',
    type: PlanDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  create(@Body() createPlanDto: CreatePlanDto): Promise<PlanDto> {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  findAll(@Query() queryDto: QueryPlanDto) {
    return this.plansService.findMany(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by id' })
  @ApiResponse({
    status: 200,
    description: 'Plan retrieved successfully',
    type: PlanDto,
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Update plan (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Plan updated successfully',
    type: PlanDto,
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete plan (Admin only)' })
  @ApiResponse({ status: 204, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.delete(id);
  }
}
