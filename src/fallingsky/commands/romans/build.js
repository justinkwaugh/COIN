import _ from '../../../lib/lodash';
import Command from '../command';
import FactionIDs from 'fallingsky/config/factionIds';
import BuildResults from './buildResults';

class Build extends Command {

    static doTest(state, args) {
        return _(state.regions).map((region) => {
            const leaderRegion = this.findLeaderRegion(state);
            if (!leaderRegion) {
                return;
            }

            if (!this.withinRangeOfLeader(region, leaderRegion)) {
                return;
            }

            const hasAlly = region.getAlliesForFaction(FactionIDs.ROMANS);
            const agreementsNeeded = hasAlly ? [] : region.getAgreementsNeededForSupplyLine(FactionIDs.ROMANS);
            const canPlaceFort = !region.getFort() && state.romans.availableForts().length > 0;
            const romanControlMargin = region.controllingMarginByFaction()[FactionIDs.ROMANS];
            const requiresFortForControl = canPlaceFort && romanControlMargin === 0;

            const canRemoveAlly = _.find(region.tribes,
                                         tribe => tribe.isAllied() && tribe.alliedFactionId() !== FactionIDs.ROMANS) &&
                                  (romanControlMargin > 0 || requiresFortForControl);

            const canPlaceAlly = region.subduedTribesForFaction(FactionIDs.ROMANS).length > 0 && (romanControlMargin > 0 || requiresFortForControl);

            if (!canPlaceFort && !canRemoveAlly && !canPlaceAlly) {
                return;
            }

            return new BuildResults({
                                        region,
                                        agreementsNeeded,
                                        canPlaceFort,
                                        canRemoveAlly,
                                        canPlaceAlly
                                    });

        }).compact().value();
    }

    static withinRangeOfLeader(region, leaderRegion) {
        const leader = leaderRegion.getLeaderForFaction(FactionIDs.ROMANS);

        return region.id === leaderRegion.id || (!leader.isSuccessor() &&
               _.find(leaderRegion.adjacent, adjacent => region.id === adjacent.id));
    }

    static findLeaderRegion(state) {
        return _.find(state.regions, function (region) {
            return _.find(region.piecesByFaction()[FactionIDs.ROMANS], {type: 'leader'});
        });
    }
}

export default Build;