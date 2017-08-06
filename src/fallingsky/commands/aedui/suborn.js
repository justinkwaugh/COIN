import _ from '../../../lib/lodash';
import Command from '../command';
import FactionIDs from '../../config/factionIds';
import SubornResults from './subornResults';

class Suborn extends Command {
    static doTest(state, args) {
        return _(state.regionsById).filter(
            function (region) {
                return _(region.piecesByFaction()[FactionIDs.AEDUI]).filter(
                        function (piece) {
                            return piece.type === 'warband' && !piece.revealed();
                        }).value().length > 0;
            }).map(
            function (region) {
                const canPlaceAlly = region.subduedTribesForFaction(FactionIDs.AEDUI).length > 0;

                const factionsWithAlliesToRemove = _(region.tribes()).map(
                    function (tribe) {
                        if (tribe.isAllied() && tribe.alliedFactionId() !== FactionIDs.AEDUI) {
                            return tribe.alliedFactionId();
                        }
                    }).compact().uniq().value();

                const factionsWithMobilePiecesToRemove = _(region.piecesByFaction()).map(
                    function (pieces, factionId) {
                        if (factionId === FactionIDs.AEDUI) {
                            return;
                        }
                        const grouped = _.groupBy(pieces, 'type');
                        if (grouped.warband || grouped.auxilia) {
                            return factionId;
                        }
                    }).compact().uniq().value();

                return new SubornResults(
                    {
                        region: region,
                        canPlaceAlly: canPlaceAlly,
                        alliedFactions: factionsWithAlliesToRemove,
                        mobileFactions: factionsWithMobilePiecesToRemove
                    });
            }).value();
    }

    static doExecute(state, args) {

    }
}
export default Suborn;