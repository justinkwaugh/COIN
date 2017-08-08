import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';

import BelgaeRally from 'fallingsky/bots/belgae/belgaeRally';
import TurnContext from 'common/turnContext';
import MovePieces from 'fallingsky/actions/movePieces';


class Event62 {
    static handleEvent(state) {
        const validRegions = _(state.regions).shuffle().filter(
            region => _.indexOf([RegionIDs.PICTONES, RegionIDs.ARVERNI, RegionIDs.BRITANNIA], region.id) >= 0 || _.find(
                region.adjacent, adjacent => adjacent.id === RegionIDs.BRITANNIA)).value();

        const target = _(validRegions).filter(region => region.getSubduedTribes().length > 0).filter(region => {
            const belgaeControlMargin = region.controllingMarginByFaction()[FactionIDs.BELGAE];
            if (belgaeControlMargin > 0) {
                return false;
            }

            const numCanMoveHere = _.reduce(validRegions, (sum, sourceRegion) => {
                if (sourceRegion.id === region.id) {
                    return sum;
                }

                const belgicWarbands = sourceRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE);
                if (belgicWarbands.length === 0) {
                    return sum;
                }

                const controlMargin = sourceRegion.controllingMarginByFaction()[FactionIDs.BELGAE];
                const amountCanMove = controlMargin <= 0 ? belgicWarbands.length : Math.min(controlMargin - 1,
                                                                                            belgicWarbands.length);

                return sum + amountCanMove;
            }, 0);

            return belgaeControlMargin + numCanMoveHere > 0;

        }).sample();

        if (!target) {
            return false;
        }

        let warbandsNeededForControl = Math.abs(target.controllingMarginByFaction()[FactionIDs.BELGAE]) + 1;
        _.each(validRegions, sourceRegion => {
            if (sourceRegion.id === target.id) {
                return;
            }

            const belgicWarbands = sourceRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE);
            if (belgicWarbands.length === 0) {
                return;
            }

            const controlMargin = sourceRegion.controllingMarginByFaction()[FactionIDs.BELGAE];
            const amountCanMove = controlMargin <= 0 ? belgicWarbands.length : Math.min(controlMargin - 1,
                                                                                        belgicWarbands.length);

            const numToMove = Math.min(amountCanMove, warbandsNeededForControl);
            if (numToMove > 0) {
                MovePieces.execute(state, {
                    sourceRegionId: sourceRegion.id,
                    destRegionId: target.id,
                    pieces: _.take(belgicWarbands, numToMove)
                });
                warbandsNeededForControl -= numToMove;
            }

            if (warbandsNeededForControl === 0) {
                return false;
            }
        });

        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e62',
                                             free: true,
                                             noSpecial: true,
                                             outOfSequence: true,
                                             allowedRegions: [target.id]
                                         }));
        BelgaeRally.rally(state, turn.getContext());
        turn.popContext();

        return true;
    }


}

export default Event62
