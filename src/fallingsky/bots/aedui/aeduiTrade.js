import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import SpecialAbilityIDs from '../../config/specialAbilityIds';
import Trade from '../../commands/aedui/trade';
import AddResources from '../../actions/addResources';

class AeduiTrade {

    static trade(state, modifiers) {
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];
        const romanFaction = state.factionsById[FactionIDs.ROMANS];

        if (aeduiFaction.resources() >= 10 && (aeduiFaction.resources() + romanFaction.resources() >= 20)) {
            return false;
        }

        if (aeduiFaction.resources() > 42) {
            return false;
        }


        const possibleTrades = Trade.test(state);
        if(!possibleTrades || possibleTrades.length === 0) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.TRADE);
        console.log('*** Aedui checking trade viability ***');
        const bot = state.playersByFaction[FactionIDs.AEDUI];
        const agreeingFactionsNeeded = _(possibleTrades).map('agreementsNeeded').flatten().flatten().concat([FactionIDs.ROMANS]).uniq().value();
        const agreements = bot.getSupplyLineAgreements(state, modifiers, agreeingFactionsNeeded);



        const resourcesToBeGained = _.reduce(
            possibleTrades, function (sum, regionResult) {
                const inSupplyLine = regionResult.inSupplyLine || _.find(
                        regionResult.agreementsNeeded, function (factionList) {
                            return _.difference(factionList, agreements).length === 0;
                        });

                if (!inSupplyLine) {
                    return sum;
                }

                const romanAgreement = _.indexOf(agreements, FactionIDs.ROMANS) >= 0;
                return sum + (romanAgreement ? regionResult.totalAeduiWithRoman : regionResult.totalAedui);
            }, 0);

        if (resourcesToBeGained <= 2) {
            console.log('*** Aedui cannot viably trade ***');
            state.turnHistory.getCurrentTurn().rollbackSpecialAbility();
            return false;
        }
        console.log('*** Aedui Trading ***');

        AddResources.execute(state, { factionId: FactionIDs.AEDUI, count: resourcesToBeGained});
        state.turnHistory.getCurrentTurn().commitSpecialAbility();

        return true;
    }
}

export default AeduiTrade;