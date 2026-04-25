# { "Depends": "py-genlayer:latest" }

from genlayer import *

class GenDomain(gl.Contract):
    registry: TreeMap[str, str]
    user_domains: TreeMap[Address, DynArray[str]]

    def __init__(self):
        pass  # GenVM auto-initializes TreeMap storage

    @gl.public.write
    def register(self, name: str, years: u64) -> str:
        name_lower = name.lower()
        owner = gl.message.sender_address

        if self.registry.get(name_lower) is not None:
            raise gl.vm.UserError("Domain already taken")

        duration = years * u64(31536000)
        expiry_date = u64(1714050000) + duration

        self.registry[name_lower] = f"{owner}|{expiry_date}"

        # ✅ FIX: Access the DynArray directly — GenVM auto-initializes it.
        # NEVER call DynArray[str]() manually, it raises TypeError.
        self.user_domains[owner].append(name_lower)

        return f"{name_lower}.gen"

    @gl.public.view
    def get_owner(self, name: str) -> str:
        record = self.registry.get(name.lower())
        if record is None:
            return "None"
        return record.split("|")[0]

    @gl.public.view
    def get_user_domains(self, user_address: Address) -> list[str]:
        domains = self.user_domains.get(user_address)
        if domains is None:
            return []
        return [d for d in domains]
