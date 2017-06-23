import _ from '../../lib/lodash';
import FallingSkyFaction from './fallingSkyFaction';
import RegionIDs from '../config/regions';
import FactionIDs from '../config/factionIds';

class Aedui extends FallingSkyFaction {

    constructor() {
        const definition = {
            id: FactionIDs.AEDUI,
            name: 'Aedui',
            numWarbands: 20,
            numAlliedTribes: 6,
            numCitadels: 2
        };

        super(definition);
    }

    victoryMargin(state) {
        let maxOtherPlaced = 0;
        _.each(state.factionsById, (faction, factionId) => {
                if (factionId === this.id || factionId === 'Germanic Tribes') {
                    return;
                }

                maxOtherPlaced = Math.max(maxOtherPlaced, faction.numAlliedTribesAndCitadelsPlaced());
            });

        return this.numAlliedTribesAndCitadelsPlaced() - maxOtherPlaced;
    }

    isHomeRegion(region) {
        return region.id === RegionIDs.AEDUI;
    }

}

export default Aedui;