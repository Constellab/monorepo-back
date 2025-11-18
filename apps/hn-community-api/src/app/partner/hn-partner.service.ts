import {
  BlAbstractPaginatedService,
  BlAbstractService,
  BlFile,
  BlNotFoundException,
  BlSearchBuilder,
  BlSearchParams,
  BlSearchSortCriteria,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import { TeBlockFigureUploadedResponse, TeRichText } from '@monorepo/te-text-editor';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';

import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnUploadFileResponseDto } from '../file-aggregate/file-core/hn-abstract-file.dto';
import { HnFilePartnerService } from '../file-aggregate/file-partner/hn-file-partner.service';
import { HnUserService } from '../users/hn-user.service';
import { HnEditPartnerDto } from './hn-partner.dto';
import { HN_PARTNER_INFO_TEMPLATE, HnPartner } from './hn-partner.entity';

@Injectable()
export class HnPartnerService extends BlAbstractService<HnPartner> {
  constructor(
    @InjectRepository(HnPartner)
    private partnerRepository: Repository<HnPartner>,
    private userService: HnUserService,
    private filePartnerService: HnFilePartnerService,
    private frontService: HnFrontService
  ) {
    super(partnerRepository, HnPartner);
  }

  async findAll(): Promise<HnPartner[]> {
    return this.partnerRepository.find();
  }

  async findAllCertified(): Promise<HnPartner[]> {
    return this.partnerRepository.find({ where: { certified: true } });
  }

  async findAllMap(): Promise<HnSitemapItemBase[]> {
    const partners = await this.findAllCertified();
    return partners.map((partner) => {
      return {
        url: this.frontService.getPartnerUrl(partner.id, ClStringHelper.getCleanUrlPath(partner.name)),
        lastmod: partner.lastModifiedAt.toFormat('yyyy-MM-dd'),
        changefreq: HnSiteMapEnumChangefreq.WEEKLY,
        priority: 1,
      };
    });
  }

  async findById(partnerId: string): Promise<HnPartner> {
    const partner = await this.partnerRepository.findOne({ where: { id: partnerId } });
    if (partner) {
      const currentUser = HnCurrentUserHelper.getCurrentUser();
      if (currentUser == null || !HnCurrentUserHelper.isAdmin()) {
        if (!partner.certified && partner.user.id !== currentUser?.id) {
          throw new BlNotFoundException('Partner not found');
        }
      }
    }
    return partner;
  }

  async findByIdAndCheck(partnerId: string): Promise<HnPartner> {
    const partner = await this.findById(partnerId);
    if (!partner) {
      throw new BlNotFoundException('Partner not found');
    }
    return partner;
  }

  async findByIdAndCheckRights(partnerId: string): Promise<HnPartner> {
    const partner = await this.findByIdAndCheck(partnerId);

    if (HnCurrentUserHelper.getAndCheckCurrentUser().id !== partner.user.id)
      throw new BlUnauthorizedException();

    return partner;
  }

  async findByUserId(userId: string): Promise<HnPartner> {
    return this.partnerRepository.findOneBy({ user: { id: userId } });
  }

  async getCurrentUserPartner(): Promise<HnPartner> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    return currentUser ? this.findByUserId(currentUser.id) : null;
  }

  async searchCertified(
    nameFilter: string,
    sortsCriteria: BlSearchSortCriteria[],
    page: number = 0,
    size: number = 10
  ): Promise<ClPage<HnPartner>> {
    const where: FindOptionsWhere<HnPartner> = {};

    if (nameFilter && nameFilter.trim().length > 0) {
      where.name = Like(`%${nameFilter.trim()}%`);
    }

    where.certified = true;

    const order: any = {};
    for (const sort of sortsCriteria) {
      order[sort.key] = sort.direction;
    }

    return BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: where,
        order: order,
      },
      this.partnerRepository.manager,
      HnPartner
    );
  }

  async searchForAdmin(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<HnPartner>> {
    if (!HnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }

    const searchBuilder = new BlSearchBuilder<HnPartner>();
    searchBuilder.addSearchParams(searchParams);

    return this.findPaginated(page, size, searchBuilder.build());
  }

  async createCurrentUserPartner(createPartnerDto: HnEditPartnerDto): Promise<HnPartner> {
    const currentUser = HnCurrentUserHelper.getAndCheckCurrentUser();
    const existingPartner = await this.findByUserId(currentUser.id);

    if (existingPartner) {
      throw new UnauthorizedException('User is already a partner');
    }

    const partner = new HnPartner();
    partner.user = currentUser;
    partner.certified = false;
    partner.info = HN_PARTNER_INFO_TEMPLATE;
    partner.name = createPartnerDto.name;

    return this.partnerRepository.save(partner);
  }

  async createPartnerForUser(userId: string): Promise<HnPartner> {
    if (!HnCurrentUserHelper.isAdmin()) throw new BlUnauthorizedException();

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const partner = new HnPartner();
    partner.user = user;
    partner.certified = false;
    partner.info = HN_PARTNER_INFO_TEMPLATE;

    return this.partnerRepository.save(partner);
  }

  async certifyPartner(partnerId: string): Promise<HnPartner> {
    if (!HnCurrentUserHelper.isAdmin()) throw new BlUnauthorizedException();

    const partner = await this.partnerRepository.findOne({ where: { id: partnerId } });
    if (!partner) {
      throw new UnauthorizedException('Partner not found');
    }

    partner.certified = true;
    return this.partnerRepository.save(partner);
  }

  async decertifyPartner(partnerId: string): Promise<HnPartner> {
    if (!HnCurrentUserHelper.isAdmin()) throw new BlUnauthorizedException();

    const partner = await this.partnerRepository.findOne({ where: { id: partnerId } });
    if (!partner) {
      throw new UnauthorizedException('Partner not found');
    }

    partner.certified = false;
    return this.partnerRepository.save(partner);
  }

  async updatePartner(partnerId: string, updatePartnerDto: HnEditPartnerDto): Promise<HnPartner> {
    const partner = await this.findByIdAndCheckRights(partnerId);
    partner.name = updatePartnerDto.name;
    partner.logo = updatePartnerDto.logo;
    return this.partnerRepository.save(partner);
  }

  async updatePartnerLogo(partnerId: string, logoUrl: string): Promise<HnPartner> {
    const partner = await this.findByIdAndCheckRights(partnerId);
    partner.logo = logoUrl;
    return this.partnerRepository.save(partner);
  }

  async updatePartnerInfo(partnerId: string, info: TeRichText): Promise<HnPartner> {
    const partner = await this.findByIdAndCheck(partnerId);
    partner.info = info.toJson();
    return this.partnerRepository.save(partner);
  }

  async deleteLogo(partnerId: string): Promise<void> {
    const partner = await this.findByIdAndCheckRights(partnerId);
    partner.logo = null;
    await this.partnerRepository.save(partner);
  }

  /////////////////////////////////////// FILES  ////////////////////////////////////

  public async saveFile(file: BlFile, partnerId: string): Promise<HnUploadFileResponseDto> {
    const partner = await this.findByIdAndCheckRights(partnerId);
    return await this.filePartnerService.saveFile(partner, file);
  }

  public async saveImage(file: BlFile, partnerId: string): Promise<TeBlockFigureUploadedResponse> {
    const partner = await this.findByIdAndCheckRights(partnerId);
    return await this.filePartnerService.saveImage(partner, file);
  }

  public async saveView(file: BlFile, partnerId: string): Promise<string> {
    const partner = await this.findByIdAndCheckRights(partnerId);
    return await this.filePartnerService.saveResourceView(partner, file);
  }

  ////////////////////////////////////// LIKES ////////////////////////////////////////
  async updateLikes(partnerId: string, numberOfLikes: number): Promise<void> {
    const partner: HnPartner = await this.findByIdAndCheck(partnerId);
    partner.likes = numberOfLikes;
    await this.partnerRepository.save(partner, { listeners: false });
  }

  ////////////////////////////////////// COMMENTS ////////////////////////////////////////

  async updateComments(partnerId: string, numberOfComments: number): Promise<void> {
    const partner: HnPartner = await this.findByIdAndCheck(partnerId);
    partner.comments = numberOfComments;
    await this.partnerRepository.save(partner, { listeners: false });
  }
}
