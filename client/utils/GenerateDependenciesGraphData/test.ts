import execute from ".";
import { transactions } from "./transactions";
import { generated } from "./generated";

execute(transactions, generated).then(console.log);
