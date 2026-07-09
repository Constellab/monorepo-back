import { TeBlockType, TeRichTextDTO } from '@monorepo/te-text-editor';
import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne, Unique } from 'typeorm';

import { HnBaseEntity } from '../core/model/entities/hn-base.entity';
import { HnUser } from '../users/hn-user.entity';

@Unique(['name'])
@Entity('partner')
export class HnPartner extends HnBaseEntity {
  @Column({ type: 'boolean', default: false })
  certified!: boolean;

  @Column()
  name!: string;

  @Column({ nullable: true })
  logo?: string | null;

  @Column({ type: 'simple-json' })
  info!: TeRichTextDTO;

  @Type(() => HnUser)
  @JoinColumn()
  @OneToOne(() => HnUser, { eager: true, onDelete: 'CASCADE', nullable: false })
  user!: HnUser;

  @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0 })
  comments!: number;
}

export const HN_PARTNER_INFO_TEMPLATE: TeRichTextDTO = {
  version: 2,
  editorVersion: '2.31.0-rc.7',
  blocks: [
    {
      id: 'bukT37dV19',
      type: TeBlockType.HEADER,
      data: {
        text: '1. About your company',
        level: 2,
      },
    },
    {
      id: '_pTBKapu4M',
      type: TeBlockType.PARAGRAPH,
      data: {
        // eslint-disable-next-line max-len
        text: 'Describe in a few lines who you are: your area of expertise, years of experience, target markets, and mission. Explain how your company brings unique value to your sector.<strong>Expected structure example:</strong>[Partner Name] is a company specialized in […]. We help organizations […]. Our mission is to […].',
      },
    },
    {
      id: 'dNbjffZ_e8',
      type: TeBlockType.HEADER,
      data: {
        text: '2. How you help your clients with Constellab',
        level: 2,
      },
    },
    {
      id: '961S0C71dT',
      type: TeBlockType.PARAGRAPH,
      data: {
        // eslint-disable-next-line max-len
        text: 'Explain precisely what you bring to clients when they use Constellab. Describe your added value in the ecosystem.<strong>You can specify for example:</strong>',
      },
    },
    {
      id: 'L1bFx1dKlX',
      type: TeBlockType.LIST,
      data: {
        style: 'unordered',
        meta: {},
        items: [
          {
            content:
              'What types of Constellab projects you support (laboratory, clinical, data, AI, automation…)\n',
            meta: {},
            items: [],
          },
          {
            content: "How you facilitate the platform's integration or adoption\n",
            meta: {},
            items: [],
          },
          {
            content: 'How you help teams structure, exploit, analyze or leverage their data\n',
            meta: {},
            items: [],
          },
          {
            content: 'Client issues you solve thanks to Constellab\n',
            meta: {},
            items: [],
          },
          {
            content: 'What you do better, faster or differently thanks to your expertise\n',
            meta: {},
            items: [],
          },
        ],
      },
    },
    {
      id: '62BerQVI3I',
      type: TeBlockType.PARAGRAPH,
      data: {
        // eslint-disable-next-line max-len
        text: 'The goal is to show how your company makes Constellab even more powerful and useful for clients.',
      },
    },
    {
      id: 'weuiU97M9B',
      type: TeBlockType.HEADER,
      data: {
        text: '3. Your offers and services',
        level: 2,
      },
    },
    {
      id: 'edlakqQjp4',
      type: TeBlockType.PARAGRAPH,
      data: {
        // eslint-disable-next-line max-len
        text: 'Detail the main services you offer around Constellab. List your expertise in simple sections: integration, consulting, data, AI, laboratory, training, etc.<strong>Suggested categories to fill:</strong>',
      },
    },
    {
      id: 'KyeuSacVbO',
      type: TeBlockType.LIST,
      data: {
        style: 'unordered',
        meta: {},
        items: [
          {
            content: '<strong>Integration &amp; deployment</strong>: what you install, configure, connect\n',
            meta: {},
            items: [],
          },
          {
            content: '<strong>Data &amp; AI</strong>: types of analysis, governance, automation\n',
            meta: {},
            items: [],
          },
          {
            content:
              '<strong>Laboratory &amp; R&amp;D</strong>: regulatory support, digitalization, instruments\n',
            meta: {},
            items: [],
          },
          {
            content: '<strong>Training &amp; support</strong>: guidance, upgrades, follow-up\n',
            meta: {},
            items: [],
          },
        ],
      },
    },
    {
      id: 'vb8FwvDHdT',
      type: TeBlockType.HEADER,
      data: {
        text: '4. Your strengths and differentiators',
        level: 2,
      },
    },
    {
      id: 'sKLKaTliMh',
      type: TeBlockType.PARAGRAPH,
      data: {
        // eslint-disable-next-line max-len
        text: 'Explain what sets you apart from other players: sectoral expertise, certifications, mastered technologies, methodologies, local presence, speed of execution, etc.<strong>Points to include:</strong>',
      },
    },
    {
      id: '-dEzeNHSyS',
      type: TeBlockType.LIST,
      data: {
        style: 'unordered',
        meta: {},
        items: [
          {
            content: 'Your added value\n',
            meta: {},
            items: [],
          },
          {
            content: 'What your clients appreciate most\n',
            meta: {},
            items: [],
          },
          {
            content: 'Your key strengths (technical, human, geographical…)\n',
            meta: {},
            items: [],
          },
        ],
      },
    },
    {
      id: 'XhNtTBgibk',
      type: TeBlockType.HEADER,
      data: {
        text: '5. Your contact information',
        level: 2,
      },
    },
    {
      id: 'i3Z6AS4Bu7',
      type: TeBlockType.PARAGRAPH,
      data: {
        // eslint-disable-next-line max-len
        text: 'Clearly indicate how Constellab clients or partners can contact you.<strong>Information to provide:</strong>',
      },
    },
    {
      id: '0FrqaC9-Ne',
      type: TeBlockType.LIST,
      data: {
        style: 'unordered',
        meta: {},
        items: [
          {
            content: 'Email\n',
            meta: {},
            items: [],
          },
          {
            content: 'Website\n',
            meta: {},
            items: [],
          },
          {
            content: 'Phone\n',
            meta: {},
            items: [],
          },
          {
            content: 'Address (optional)\n',
            meta: {},
            items: [],
          },
        ],
      },
    },
    {
      id: 'dtUi3EFN8A',
      type: TeBlockType.HEADER,
      data: {
        text: '6. (Optional) Your references / client cases',
        level: 2,
      },
    },
    {
      id: 'eRuZdV8rsa',
      type: TeBlockType.PARAGRAPH,
      data: {
        // eslint-disable-next-line max-len
        text: 'If you wish, add some logos or testimonials showing your experience in the field or with Constellab.',
      },
    },
  ],
};
