import FallingSkyFaction from './fallingSkyFaction';
import RegionGroups from '../config/regionGroups';
import FactionIDs from '../config/factionIds';

class GermanicTribes extends FallingSkyFaction {
    constructor() {
        const definition = {
            id: FactionIDs.GERMANIC_TRIBES,
            name: 'Germans',
            numWarbands: 15,
            numAlliedTribes: 6,
            numCitadels: 0
        };
        super(definition);
    }

    isHomeRegion(region) {
        return region.group === RegionGroups.GERMANIA;
    }
}

export default GermanicTribes;