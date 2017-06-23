import _ from '../../lib/lodash';
import FallingSkyRegion from '../board/fallingSkyRegion';
import SupplyLines from './supplyLines';
import TribeIDs from './tribeIds';
import RegionIDs from './regionIds';
import RegionGroups from './regionGroups';

const Definitions = {};

Definitions[RegionIDs.AEDUI] = {
    id: RegionIDs.AEDUI,
    name: 'Aedui',
    group: RegionGroups.CELTICA,
    controlValue: 1,
    adjacent: [RegionIDs.ARVERNI,
               RegionIDs.BITURIGES,
               RegionIDs.MANDUBII,
               RegionIDs.PROVINCIA,
               RegionIDs.SEQUANI],
    tribes: [TribeIDs.AEDUI]
};

Definitions[RegionIDs.AQUITANIA] = {
    id: RegionIDs.AQUITANIA,
    name: 'Aquitania',
    group: RegionGroups.AQUITANIA,
    controlValue: 0,
    inPlay: false,
    adjacent: [RegionIDs.ARVERNI],
    tribes: []
};

Definitions[RegionIDs.ARVERNI] = {
    id: RegionIDs.ARVERNI,
    name: 'Arverni',
    group: RegionGroups.CELTICA,
    controlValue: 3,
    adjacent: [RegionIDs.AEDUI,
               RegionIDs.BITURIGES,
               RegionIDs.PICTONES,
               RegionIDs.PROVINCIA],
    tribes: [TribeIDs.ARVERNI, TribeIDs.CADURCI, TribeIDs.VOLCAE]
};

Definitions[RegionIDs.ATREBATES] = {
    id: RegionIDs.ATREBATES,
    name: 'Atrebates',
    group: RegionGroups.BELGICA,
    controlValue: 3,
    adjacent: [RegionIDs.BRITANNIA,
               RegionIDs.CARNUTES,
               RegionIDs.MANDUBII,
               RegionIDs.MORINI,
               RegionIDs.NERVII,
               RegionIDs.TREVERI,
               RegionIDs.VENETI],
    tribes: [TribeIDs.ATREBATES, TribeIDs.BELLOVACI, TribeIDs.REMI]
};

Definitions[RegionIDs.BITURIGES] = {
    id: RegionIDs.BITURIGES,
    name: 'Bituriges',
    group: RegionGroups.CELTICA,
    controlValue: 1,
    adjacent: [RegionIDs.AEDUI,
               RegionIDs.ARVERNI,
               RegionIDs.CARNUTES,
               RegionIDs.MANDUBII,
               RegionIDs.PICTONES],
    tribes: [TribeIDs.BITURIGES]
};

Definitions[RegionIDs.BRITANNIA] = {
    id: RegionIDs.BRITANNIA,
    name: 'Britannia',
    group: RegionGroups.BRITANNIA,
    controlValue: 1,
    adjacent: [RegionIDs.VENETI,
               RegionIDs.ATREBATES,
               RegionIDs.MORINI],
    tribes: [TribeIDs.CATUVELLAUNI]
};

Definitions[RegionIDs.CARNUTES] = {
    id: RegionIDs.CARNUTES,
    name: 'Carnutes',
    group: RegionGroups.CELTICA,
    controlValue: 2,
    adjacent: [RegionIDs.ATREBATES,
               RegionIDs.BITURIGES,
               RegionIDs.MANDUBII,
               RegionIDs.PICTONES,
               RegionIDs.VENETI],
    tribes: [TribeIDs.CARNUTES, TribeIDs.AULERCI]
};

Definitions[RegionIDs.CISALPINA] = {
    id: RegionIDs.CISALPINA,
    name: 'Cisalpina',
    group: RegionGroups.CISALPINA,
    controlValue: 0,
    inPlay: false,
    adjacent: [RegionIDs.PROVINCIA,
               RegionIDs.SEQUANI,
               RegionIDs.UBII],
    tribes: []
};

Definitions[RegionIDs.MANDUBII] = {
    id: RegionIDs.MANDUBII,
    name: 'Mandubii',
    group: RegionGroups.CELTICA,
    controlValue: 3,
    adjacent: [RegionIDs.AEDUI,
               RegionIDs.ATREBATES,
               RegionIDs.BITURIGES,
               RegionIDs.CARNUTES,
               RegionIDs.TREVERI,
               RegionIDs.SEQUANI],
    tribes: [TribeIDs.MANDUBII, TribeIDs.SENONES, TribeIDs.LINGONES]
};

Definitions[RegionIDs.MORINI] = {
    id: RegionIDs.MORINI,
    name: 'Morini',
    group: RegionGroups.BELGICA,
    controlValue: 2,
    adjacent: [RegionIDs.ATREBATES,
               RegionIDs.BRITANNIA,
               RegionIDs.NERVII,
               RegionIDs.SUGAMBRI],
    tribes: [TribeIDs.MORINI, TribeIDs.MENAPII]
};

Definitions[RegionIDs.NERVII] = {
    id: RegionIDs.NERVII,
    name: 'Nervii',
    group: RegionGroups.BELGICA,
    controlValue: 2,
    adjacent: [RegionIDs.ATREBATES,
               RegionIDs.MORINI,
               RegionIDs.SUGAMBRI,
               RegionIDs.TREVERI],
    tribes: [TribeIDs.NERVII, TribeIDs.EBURONES]
};

Definitions[RegionIDs.PICTONES] = {
    id: RegionIDs.PICTONES,
    name: 'Pictones',
    group: RegionGroups.CELTICA,
    controlValue: 2,
    adjacent: [RegionIDs.ARVERNI,
               RegionIDs.BITURIGES,
               RegionIDs.CARNUTES,
               RegionIDs.VENETI],
    tribes: [TribeIDs.PICTONES, TribeIDs.SANTONES]
};

Definitions[RegionIDs.PROVINCIA] = {
    id: RegionIDs.PROVINCIA,
    name: 'Provincia',
    group: RegionGroups.PROVINCIA,
    controlValue: 1,
    adjacent: [RegionIDs.AEDUI,
               RegionIDs.ARVERNI,
               RegionIDs.CISALPINA,
               RegionIDs.SEQUANI],
    tribes: [TribeIDs.HELVII]
};

Definitions[RegionIDs.SEQUANI] = {
    id: RegionIDs.SEQUANI,
    name: 'Sequani',
    group: RegionGroups.CELTICA,
    controlValue: 2,
    adjacent: [RegionIDs.AEDUI,
               RegionIDs.CISALPINA,
               RegionIDs.MANDUBII,
               RegionIDs.PROVINCIA,
               RegionIDs.TREVERI,
               RegionIDs.UBII],
    tribes: [TribeIDs.SEQUANI, TribeIDs.HELVETII]
};

Definitions[RegionIDs.SUGAMBRI] = {
    id: RegionIDs.SUGAMBRI,
    name: 'Sugambri',
    group: RegionGroups.GERMANIA,
    controlValue: 1,
    adjacent: [RegionIDs.MORINI,
               RegionIDs.NERVII,
               RegionIDs.TREVERI,
               RegionIDs.UBII],
    tribes: [TribeIDs.SUGAMBRI, TribeIDs.SUEBI_NORTH]
};

Definitions[RegionIDs.TREVERI] = {
    id: RegionIDs.TREVERI,
    name: 'Treveri',
    group: RegionGroups.CELTICA,
    controlValue: 1,
    adjacent: [RegionIDs.ATREBATES,
               RegionIDs.MANDUBII,
               RegionIDs.NERVII,
               RegionIDs.SEQUANI,
               RegionIDs.SUGAMBRI,
               RegionIDs.UBII],
    tribes: [TribeIDs.TREVERI]
};

Definitions[RegionIDs.UBII] = {
    id: RegionIDs.UBII,
    name: 'Ubii',
    group: RegionGroups.GERMANIA,
    controlValue: 1,
    adjacent: [RegionIDs.CISALPINA,
               RegionIDs.SEQUANI,
               RegionIDs.SUGAMBRI,
               RegionIDs.TREVERI],
    tribes: [TribeIDs.UBII, TribeIDs.SUEBI_SOUTH]
};

Definitions[RegionIDs.VENETI] = {
    id: RegionIDs.VENETI,
    name: 'Veneti',
    group: RegionGroups.CELTICA,
    controlValue: 2,
    adjacent: [RegionIDs.ATREBATES,
               RegionIDs.BRITANNIA,
               RegionIDs.CARNUTES,
               RegionIDs.PICTONES],
    tribes: [TribeIDs.VENETI, TribeIDs.NAMNETES]
};

class Regions {
    static generateRegions(tribesById) {
        const regions = _.map(Definitions, function (definition) {
                return new FallingSkyRegion(definition, tribesById);
            });
        const regionsById = _.keyBy(regions, 'id');
        _.each(regions, function (region) {
                region.adjacent = _.map(region.adjacent, function (regionId) {
                        return regionsById[regionId];
                    });
            });
        SupplyLines.populateSupplyLines(regionsById, RegionIDs.CISALPINA);
        return regions;
    }
}

export default Regions;