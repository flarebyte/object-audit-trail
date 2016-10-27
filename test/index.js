import test from "tape"
import objectAuditTrail from "../src"

test("objectAuditTrail", (t) => {
  t.plan(1)
  t.equal(true, objectAuditTrail(), "return true")
})
