import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlerService } from '../handler/handler.service';

@Injectable()
export class OrderService {
  private readonly shop: string;
  private readonly token: string;

  constructor(private readonly config: ConfigService, private readonly handler: HandlerService){
          this.shop = this.config.get<string>("SHOPIFY_URL")!;
          this.token = this.config.get<string>("SHOPIFY_API_SECRET")!;
  }
  
  async placeOrderWebhook(): Promise<any> {
    const payload =  {
      "snoonu_ref": "002",
      "customer_name": "Snoonu",
      "phone": "+57349539457",
      "email": "snoonu@test.com",
      "street": "Abc, Raji Mansion",
      "city": "Doha",

      "amount_tax": 1,
      "amount_total": 91,
      "amount_paid": 91,
      "amount_return": 0,

      "pos_reference": "SNOONU-001",

      "lines": [
        {
          "product_id": 38,
          "qty": 1,
          "price_unit": 120.0,
          "discount": 10.0,
          "price_subtotal": 110.0,
          "price_subtotal_incl": 110.0
        }
      ]
    }

    const response = await this.handler.odooApiHandler('/api/pos/create-order', 'POST', payload);
    return response;
  }

  async cancelOrderWebhook(): Promise<any> {
    const payload = {
    "snoonu_ref": "001",
    "reason": "Customer cancelled"
  }
  const response = await this.handler.odooApiHandler('/api/pos/create-order', 'POST', payload);
  return response;
  }

}
