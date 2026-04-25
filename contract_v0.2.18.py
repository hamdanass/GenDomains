# { "Depends": "py-genlayer:latest" }

from genlayer import *

class GenDomain(gl.Contract):
    registry: TreeMap[str, str]
    user_domains: TreeMap[Address, str]  # comma-separated: "anadev,test,hello"

    def __init__(self):
        pass

    @gl.public.write
    def register(self, name: str, years: u64) -> str:
        name_lower = name.lower()
        owner = gl.message.sender_address

        if self.registry.get(name_lower) is not None:
            raise gl.vm.UserError("Domain already taken")

        duration = years * u64(31536000)
        expiry_date = u64(1714050000) + duration
        self.registry[name_lower] = f"{owner}|{expiry_date}"

        # ✅ FIX: TreeMap[Address, str] with comma-separated values.
        # DynArray nested in TreeMap cannot be accessed before first set — KeyError.
        # Comma-separated string is the safe alternative.
        existing = self.user_domains.get(owner)
        if existing is None:
            self.user_domains[owner] = name_lower
        else:
            self.user_domains[owner] = existing + "," + name_lower

        return f"{name_lower}.gen"

    @gl.public.view
    def get_owner(self, name: str) -> str:
        record = self.registry.get(name.lower())
        if record is None:
            return "None"
        return record.split("|")[0]

    @gl.public.view
    def get_user_domains(self, user_address: Address) -> list[str]:
        domains_str = self.user_domains.get(user_address)
        if domains_str is None:
            return []
        return domains_str.split(",")
