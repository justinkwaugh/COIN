import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';
import RemovePieces from '../../../actions/removePieces';

class Event56 {
    static handleEvent(state) {
        const belgaeFaction = state.factionsById[FactionIDs.BELGAE];

        const romanRegions = state.getControlledRegionsForFaction(FactionIDs.ROMANS);
        const ambiorixEntry = _(
            belgaeFaction.victoryMargin(state) < -5 ? state.regions : romanRegions).map(function (region) {
                const ambiorix = _.find(
                    region.piecesByFaction()[FactionIDs.BELGAE], function (piece) {
                        return piece.type === 'leader' && !piece.isSuccessor();
                    });

                if (ambiorix) {
                    return {
                        ambiorix,
                        region,
                    };
                }
                return null;
            }).compact().first();

        if (ambiorixEntry) {
            RemovePieces.execute(state, {factionId: FactionIDs.BELGAE, regionId: ambiorixEntry.region.id, pieces: [ambiorixEntry.ambiorix]});
            return true;
        }

        return false;
    }

}

export default Event56;
