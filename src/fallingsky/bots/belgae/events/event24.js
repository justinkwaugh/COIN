import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RemovePieces from 'fallingsky/actions/removePieces';
class Event24 {
    static handleEvent(state) {
        const targetRegion = _(state.regions).shuffle().map(region=> {
            if(!region.getCitadelForFaction(FactionIDs.ARVERNI)) {
                return;
            }

            const legions = region.getLegions();
            const auxilia = region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
            if(legions.length === 0 && auxilia.length === 0) {
                return;
            }

            const priority = (20 - legions.length) + '-' + (20 - auxilia.length);

            return {
                region,
                priority
            };

        }).compact().sortBy('priority').first();

        if(!targetRegion) {
            return false;
        }

        const legions = targetRegion.getLegions();
        const auxilia = targetRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);

        let numToRemove = 2;
        const pieces = [];
        const numLegions = Math.min(numToRemove, legions.length);
        if(numLegions > 0) {
            numToRemove -= numLegions;
            pieces.push.apply(pieces, _.take(legions, numLegions));
        }

        if(numToRemove > 0) {
            const numAuxilia = Math.min(numToRemove, auxilia.length);
            if(numAuxilia > 0) {
                pieces.push.apply(pieces, _.take(auxilia, numAuxilia));
            }
        }

        RemovePieces.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: targetRegion.id,
            pieces: pieces
        });

        return true;
    }
}

export default Event24
