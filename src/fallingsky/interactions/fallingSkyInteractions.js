import PlayerInteractionFactory from '../../common/playerInteractionFactory';
import RetreatAgreement from './retreatAgreement';
import RetreatDeclaration from './retreatDeclaration';
import SupplyLineAgreement from './supplyLineAgreement';

class FallingSkyInteractions {
  constructor() {
  }

  static registerWithFactory() {
    PlayerInteractionFactory.register((new RetreatAgreement({})).type, RetreatAgreement);
    PlayerInteractionFactory.register((new RetreatDeclaration({})).type, RetreatDeclaration);
    PlayerInteractionFactory.register((new SupplyLineAgreement({})).type, SupplyLineAgreement);
  }
}

export default FallingSkyInteractions;