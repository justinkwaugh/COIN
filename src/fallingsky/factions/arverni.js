import FallingSkyFaction from './fallingSkyFaction';
import RegionIDs from '../config/regionIds';
import FactionIDs from '../config/factionIds';

class Arverni extends FallingSkyFaction {
    constructor() {
        const definition = {
            id: FactionIDs.ARVERNI,
            name: 'Arverni',
            numWarbands: 35,
            numAlliedTribes: 10,
            numCitadels: 3,
            hasLeader: true,
            leaderName: 'Vercingetorix'
        };
        super(definition);
    }

    victoryMargin(state) {
        const romans = state.factionsById[FactionIDs.ROMANS];
        const offMapLegionMargin = romans.offMapLegions() - 6;
        const alliesAndCitadelsMargin = this.numAlliedTribesAndCitadelsPlaced() - 8;
        return Math.min(offMapLegionMargin, alliesAndCitadelsMargin);
    }

    isHomeRegion(region) {
        return region.id === RegionIDs.ARVERNI;
    }
}

export default Arverni;