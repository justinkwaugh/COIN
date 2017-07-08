import Tribe from '../board/tribe';
import TribeIDs from './tribeIds';
import RegionIDs from './regionIds';

const Definitions = {};

Definitions[TribeIDs.AEDUI] = {
    id: TribeIDs.AEDUI,
    regionId: RegionIDs.AEDUI,
    name: 'Aedui',
    isCity: true,
    factionRestriction: 'Aedui'

};

Definitions[TribeIDs.ARVERNI] = {
    id: TribeIDs.ARVERNI,
    regionId: RegionIDs.ARVERNI,
    name: 'Arverni',
    isCity: true,
    factionRestriction: 'Arverni'
};

Definitions[TribeIDs.ATREBATES] = {
    id: TribeIDs.ATREBATES,
    regionId: RegionIDs.ATREBATES,
    name: 'Atrebates'
};

Definitions[TribeIDs.AULERCI] = {
    id: TribeIDs.AULERCI,
    regionId: RegionIDs.CARNUTES,
    name: 'Aulerci'
};

Definitions[TribeIDs.BELLOVACI] = {
    id: TribeIDs.BELLOVACI,
    regionId: RegionIDs.ATREBATES,
    name: 'Bellovaci'
};

Definitions[TribeIDs.BITURIGES] = {
    id: TribeIDs.BITURIGES,
    regionId: RegionIDs.BITURIGES,
    name: 'Bituriges',
    isCity: true
};

Definitions[TribeIDs.CADURCI] = {
    id: TribeIDs.CADURCI,
    regionId: RegionIDs.ARVERNI,
    name: 'Cadurci'
};

Definitions[TribeIDs.CARNUTES] = {
    id: TribeIDs.CARNUTES,
    regionId: RegionIDs.CARNUTES,
    name: 'Carnutes',
    isCity: true
};

Definitions[TribeIDs.CATUVELLAUNI] = {
    id: TribeIDs.CATUVELLAUNI,
    regionId: RegionIDs.BRITANNIA,
    name: 'Catuvellauni'
};

Definitions[TribeIDs.COLONY] = {
    id: TribeIDs.COLONY,
    regionId: null,
    name: 'Colony'
};

Definitions[TribeIDs.EBURONES] = {
    id: TribeIDs.EBURONES,
    regionId: RegionIDs.NERVII,
    name: 'Eburones'
};

Definitions[TribeIDs.HELVETII] = {
    id: TribeIDs.HELVETII,
    regionId: RegionIDs.SEQUANI,
    name: 'Helvetii'
};

Definitions[TribeIDs.HELVII] = {
    id: TribeIDs.HELVII,
    regionId: RegionIDs.PROVINCIA,
    name: 'Helvii'
};

Definitions[TribeIDs.LINGONES] = {
    id: TribeIDs.LINGONES,
    regionId: RegionIDs.MANDUBII,
    name: 'Lingones'
};

Definitions[TribeIDs.MANDUBII] = {
    id: TribeIDs.MANDUBII,
    regionId: RegionIDs.MANDUBII,
    name: 'Mandubii',
    isCity: true
};

Definitions[TribeIDs.MENAPII] = {
    id: TribeIDs.MENAPII,
    regionId: RegionIDs.MORINI,
    name: 'Menapii'
};

Definitions[TribeIDs.MORINI] = {
    id: TribeIDs.MORINI,
    regionId: RegionIDs.MORINI,
    name: 'Morini'
};

Definitions[TribeIDs.NAMNETES] = {
    id: TribeIDs.NAMNETES,
    regionId: RegionIDs.VENETI,
    name: 'Namenetes'
};

Definitions[TribeIDs.NERVII] = {
    id: TribeIDs.NERVII,
    regionId: RegionIDs.NERVII,
    name: 'Nervii'
};

Definitions[TribeIDs.PICTONES] = {
    id: TribeIDs.PICTONES,
    regionId: RegionIDs.PICTONES,
    name: 'Pictones'
};

Definitions[TribeIDs.REMI] = {
    id: TribeIDs.REMI,
    regionId: RegionIDs.ATREBATES,
    name: 'Remi'
};

Definitions[TribeIDs.SANTONES] = {
    id: TribeIDs.SANTONES,
    regionId: RegionIDs.PICTONES,
    name: 'Santones'
};

Definitions[TribeIDs.SENONES] = {
    id: TribeIDs.SENONES,
    regionId: RegionIDs.MANDUBII,
    name: 'Senones'
};

Definitions[TribeIDs.SEQUANI] = {
    id: TribeIDs.SEQUANI,
    regionId: RegionIDs.SEQUANI,
    name: 'Sequani',
    isCity: true
};

Definitions[TribeIDs.SUEBI_NORTH] = {
    id: TribeIDs.SUEBI_NORTH,
    regionId: RegionIDs.SUGAMBRI,
    name: 'Suebi (North)',
    factionRestriction: 'Germanic'
};

Definitions[TribeIDs.SUEBI_SOUTH] = {
    id: TribeIDs.SUEBI_SOUTH,
    regionId: RegionIDs.UBII,
    name: 'Suebi (South)',
    factionRestriction: 'Germanic'
};

Definitions[TribeIDs.SUGAMBRI] = {
    id: TribeIDs.SUGAMBRI,
    regionId: RegionIDs.SUGAMBRI,
    name: 'Sugambri'
};

Definitions[TribeIDs.TREVERI] = {
    id: TribeIDs.TREVERI,
    regionId: RegionIDs.TREVERI,
    name: 'Treveri'
};

Definitions[TribeIDs.UBII] = {
    id: TribeIDs.UBII,
    regionId: RegionIDs.UBII,
    name: 'Ubii'
};

Definitions[TribeIDs.VENETI] = {
    id: TribeIDs.VENETI,
    regionId: RegionIDs.VENETI,
    name: 'Veneti'
};

Definitions[TribeIDs.VOLCAE] = {
    id: TribeIDs.VOLCAE,
    regionId: RegionIDs.ARVERNI,
    name: 'Volcae'
};

class Tribes {
    static generateTribes() {
        return _.map(
            Definitions, function (definition) {
                return new Tribe(definition);
            });
    }
}

export default Tribes;