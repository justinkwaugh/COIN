import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import ReturnLegions from 'fallingsky/actions/returnLegions';
import RemovePieces from 'fallingsky/actions/removePieces';
class Event7 {
    static handleEvent(state) {

        if (state.romans.numLegionsInTrack() > 7) {
            return false;
        }

        const regionWithLegion = _.find(_.shuffle(state.regions), region => region.getLegions().length > 0);
        if (regionWithLegion) {
            ReturnLegions.execute(state, {
                regionId: regionWithLegion.id,
                count: 1
            });
        }

        const auxiliaToRemove = _(state.regions).shuffle().map(region => {
            const auxilia = region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
            if (auxilia.length === 0) {
                return;
            }

            let hidden = region.getHiddenWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
            if (hidden.length > 0) {
                return {
                    regionId: region.id,
                    auxilia: _.take(hidden, 1),
                    priority: 'a'
                }
            }

            return {
                regionId: region.id,
                auxilia: _.take(auxilia, 1),
                priority: 'b'
            }

        }).compact().sortBy('priority').first();

        RemovePieces.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: auxiliaToRemove.regionId,
            pieces: auxiliaToRemove.auxilia
        });

        return true;
    }
}

export default Event7
