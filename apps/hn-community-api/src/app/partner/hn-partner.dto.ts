import { TeRichTextDTO } from '@monorepo/te-text-editor';

import { HnBaseDto } from '../core/model/entities/hn-base.dto';
import { HnUserDto } from '../users/hn-user.dto';
import { HnPartner } from './hn-partner.entity';

export class HnPartnerDto extends HnBaseDto {
  certified!: boolean;
  user!: HnUserDto;
  name!: string;
  logo?: string | null;
  likes!: number;
  comments!: number;

  constructor(partner: HnPartner) {
    super(partner);

    if (!partner) return;

    this.certified = partner.certified;
    this.user = new HnUserDto(partner.user);
    this.name = partner.name;
    this.logo = partner.logo;
    this.likes = partner.likes;
    this.comments = partner.comments;
  }

  static fromEntity(partner: HnPartner): HnPartnerDto;
  static fromEntity(partner: HnPartner | null | undefined): HnPartnerDto | null;
  static fromEntity(partner: HnPartner | null | undefined): HnPartnerDto | null {
    if (!partner) return null;
    return new HnPartnerDto(partner);
  }
}

export class HnPartnerDetailDto extends HnPartnerDto {
  info!: TeRichTextDTO;

  constructor(partner: HnPartner) {
    super(partner);
    if (!partner) return;
    this.info = partner.info;
  }

  static fromEntity(partner: HnPartner): HnPartnerDetailDto;
  static fromEntity(partner: HnPartner | null | undefined): HnPartnerDetailDto | null;
  static fromEntity(partner: HnPartner | null | undefined): HnPartnerDetailDto | null {
    if (!partner) return null;
    return new HnPartnerDetailDto(partner);
  }
}

export interface HnEditPartnerDto {
  name: string;
  logo?: string;
}
